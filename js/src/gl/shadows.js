'use strict';

class LarxShadows {
    init(quality, shader) {
        this.resolution = Math.pow(2, quality);

        this.shadowMap = new LarxFramebuffer(this.resolution, this.resolution);
        this.shadowMap.buildDepthBuffer();
        this.shader = shader;
        this.setOffset();
        this.calculateWidthsAndHeights();
        
        this.UP = vec3.fromValues(0, 1, 0);
        this.FORWARD = vec4.fromValues(0, 0, -1);
    }

    setOffset() {
        let vec = vec3.fromValues(0.5, 0.5, 0.5);
        this.offset = mat4.create();
        mat4.translate(this.offset, this.offset, vec);
        mat4.scale(this.offset, this.offset, vec);
    }


    bind() {
        this.projectionMatrix = mat4.create();
        this.lightViewMatrix = mat4.create();
        this.projectionViewMatrix = mat4.create();
        
        this.update();
        this.updateOrthoProjectionMatrix();
        this.updateLightViewMatrix();
        
        mat4.identity(this.projectionViewMatrix);
        mat4.multiply(this.projectionViewMatrix, this.projectionMatrix, this.lightViewMatrix);
        
        this.shader.use();
        this.shader.setMatrix(this.projectionViewMatrix);
        this.shadowMap.bind(true);
    }

    unbind() {
        this.shadowMap.unbind();
    }

    enable(targetShader) {
        this.shadowMap.bindDepthTexture(Larx.gl.TEXTURE4);
        targetShader.setShadowMapTexture(4);
        targetShader.setShadowDistanceTransition(this.shadowDistance, this.shadowDistance / 10);
        targetShader.setShadowMapResolution(this.resolution);
        targetShader.enableShadows(true);
        
        mat4.multiply(this.projectionViewMatrix, this.offset, this.projectionViewMatrix);
        targetShader.setShadowMapSpaceMatrix(this.projectionViewMatrix);
    }
    
    disable(targetShader) {
        targetShader.enableShadows(false);
    }

    updateOrthoProjectionMatrix() {
        mat4.identity(this.projectionMatrix);
        
        this.projectionMatrix[0] = 2.0 / (this.maxX - this.minX);
        this.projectionMatrix[5] = 2.0 / (this.maxY - this.minY);
        this.projectionMatrix[10] = -2.0 / (this.maxZ - this.minZ);
        this.projectionMatrix[15] = 1.0;
    }

    updateLightViewMatrix() {
        mat4.identity(this.lightViewMatrix);
        
        
        let lightDirection = vec3.fromValues(
            this.shader.light.direction[0], 
            this.shader.light.direction[1], 
            this.shader.light.direction[2]);
        
        
        vec3.normalize(lightDirection, lightDirection);
        
        let pitch = Math.acos(vec2.length(vec2.fromValues(lightDirection[0], lightDirection[2])));
        let yaw = Larx.Math.radToDeg(Math.atan(lightDirection[0] / lightDirection[2]));
        
		yaw = lightDirection[2] > 0 ? yaw - 180 : yaw;
        
        mat4.rotateX(this.lightViewMatrix, this.lightViewMatrix, pitch);
        mat4.rotateY(this.lightViewMatrix, this.lightViewMatrix, -Larx.Math.degToRad(yaw)); 
        mat4.translate(this.lightViewMatrix, this.lightViewMatrix, vec3.fromValues(this.camMatrix.x, this.camMatrix.y, this.camMatrix.z));
    }

    update() {
        this.camMatrix = Larx.Camera.getMatrix();
        this.calculateShadowDistance();
        
        let rotation = this.calculateCameraRotationMatrix();
        let forwardVector = vec3.create();
        vec3.transformMat4(forwardVector, this.FORWARD, rotation);

        let toFar = vec3.create(), toNear = vec3.create();

        vec3.copy(toFar, forwardVector);
        vec3.copy(toNear, forwardVector);

        vec3.scale(toFar, toFar, this.shadowDistance);
        vec3.scale(toNear, toNear, Larx.Matrix.nearPlane);

        let centerNear = vec3.create(), centerFar = vec3.create();
        
        vec3.add(centerNear, vec3.fromValues(this.camMatrix.x, this.camMatrix.y, this.camMatrix.z), toNear);
        vec3.add(centerFar, vec3.fromValues(this.camMatrix.x, this.camMatrix.y, this.camMatrix.z), toFar);
        
        let points = this.calculateFrustumVertices(rotation, forwardVector, centerNear, centerFar);
        let first = true;
        
        for (var i = 0; i < 8; i++) {
            let p = points[i];
            
            if(first) {
                this.minX = p[0];
                this.maxX = p[0];
                this.minY = p[1];
                this.maxY = p[1];
                this.minZ = p[2];
                this.maxZ = p[2];
                first = false;
            }
            
            if (p[0] > this.maxX) { this.maxX = p[0] }
            if (p[0] < this.minX) { this.minX = p[0] }

            if (p[1] > this.maxY) { this.maxY = p[1] }
            if (p[1] < this.minY) { this.minY = p[1] }

            if (p[2] > this.maxZ) { this.maxZ = p[2] }
            if (p[2] < this.minZ) { this.minZ = p[2] }
        }
        
        this.maxZ += 10;
    }
    
    calculateShadowDistance() {
        this.shadowDistance = Larx.Camera.zoomLevel * 5;
        if(this.shadowDistance > Larx.Matrix.farPlane) {
            this.shadowDistance = Larx.Matrix.farPlane;
        }
    }

    calculateCameraRotationMatrix() {
        let rot = mat4.create();
        
        mat4.rotateX(rot, rot, -this.camMatrix.rotV);
        mat4.rotateY(rot, rot, -this.camMatrix.rotH);
        return rot;
    }
    
    calculateWidthsAndHeights() {
        let aspect = Larx.gl.viewportWidth / Larx.gl.viewportHeight;
        
		this.farWidth = this.shadowDistance * Math.tan(Larx.Math.degToRad(Larx.Matrix.fieldOfView));
		this.nearWidth = Larx.Matrix.nearPlane * Math.tan(Larx.Math.degToRad(Larx.Matrix.fieldOfView));
		this.farHeight = this.farWidth / aspect;
		this.nearHeight = this.nearWidth / aspect;
	}

    calculateFrustumVertices(rotation, forwardVector, centerNear, centerFar) {
        let upVector = vec3.create(), rightVector = vec3.create();
            
        vec3.transformMat4(upVector, this.UP, rotation);
        vec3.cross(rightVector, upVector, forwardVector);
                
        let downVector = vec3.fromValues(-upVector[0], -upVector[1], -upVector[2]);
        let leftVector = vec3.fromValues(-rightVector[0], -rightVector[1], -rightVector[2]);
        
        let farTop = vec3.create(), farBottom = vec3.create(), nearTop = vec3.create(), nearBottom = vec3.create();
        this.calculateWidthsAndHeights();
            
        vec3.add(farTop, centerFar, vec3.fromValues(upVector[0] * this.farHeight, upVector[1] * this.farHeight, upVector[2] * this.farHeight));
        vec3.add(farBottom, centerFar, vec3.fromValues(downVector[0] * this.farHeight, downVector[1] * this.farHeight, downVector[2] * this.farHeight));
        
        vec3.add(nearTop, centerNear, vec3.fromValues(upVector[0] * this.nearHeight, upVector[1] * this.nearHeight, upVector[2] * this.nearHeight));
        vec3.add(nearBottom, centerNear, vec3.fromValues(downVector[0] * this.nearHeight, downVector[1] * this.nearHeight, downVector[2] * this.nearHeight));
        
        let points = [];
        points.push(this.calculateLightSpaceFrustumCorner(farTop, rightVector, this.farWidth));
        points.push(this.calculateLightSpaceFrustumCorner(farTop, leftVector, this.farWidth));
        points.push(this.calculateLightSpaceFrustumCorner(farBottom, rightVector, this.farWidth));
        points.push(this.calculateLightSpaceFrustumCorner(farBottom, leftVector, this.farWidth));
        points.push(this.calculateLightSpaceFrustumCorner(nearTop, rightVector, this.nearWidth));
        points.push(this.calculateLightSpaceFrustumCorner(nearTop, leftVector, this.nearWidth));
        points.push(this.calculateLightSpaceFrustumCorner(nearBottom, rightVector, this.nearWidth));
        points.push(this.calculateLightSpaceFrustumCorner(nearBottom, leftVector, this.nearWidth));
        
        return points;
    }
    
    calculateLightSpaceFrustumCorner(startPoint, direction, width) {       
        let point = vec3.create();
        vec3.add(point, startPoint, vec3.fromValues(direction[0] * width, direction[1] * width, direction[2] * width));
        
        let point4f = vec4.fromValues(point[0], point[1], point[2], 1);
        vec4.transformMat4(point4f, point4f, this.lightViewMatrix);
        return point4f;
    }
}