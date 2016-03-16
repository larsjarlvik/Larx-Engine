"use strict";

class LarxFrustum  {
    constructor () {
        this.clip = Array(16);
        this.frustum = Array(6);
        
        for(let i = 0; i < this.frustum.length; i++) {
            this.frustum[i] = new Array(4);
        }
    }
    
    extractFrustum() {
        let mMat = Larx.Matrix.mvMatrix;
        let pMat = Larx.Matrix.pMatrix;
        let t;

        this.clip[ 0] = mMat[ 0] * pMat[ 0] + mMat[ 1] * pMat[ 4] + mMat[ 2] * pMat[ 8] + mMat[ 3] * pMat[12];
        this.clip[ 1] = mMat[ 0] * pMat[ 1] + mMat[ 1] * pMat[ 5] + mMat[ 2] * pMat[ 9] + mMat[ 3] * pMat[13];
        this.clip[ 2] = mMat[ 0] * pMat[ 2] + mMat[ 1] * pMat[ 6] + mMat[ 2] * pMat[10] + mMat[ 3] * pMat[14];
        this.clip[ 3] = mMat[ 0] * pMat[ 3] + mMat[ 1] * pMat[ 7] + mMat[ 2] * pMat[11] + mMat[ 3] * pMat[15];

        this.clip[ 4] = mMat[ 4] * pMat[ 0] + mMat[ 5] * pMat[ 4] + mMat[ 6] * pMat[ 8] + mMat[ 7] * pMat[12];
        this.clip[ 5] = mMat[ 4] * pMat[ 1] + mMat[ 5] * pMat[ 5] + mMat[ 6] * pMat[ 9] + mMat[ 7] * pMat[13];
        this.clip[ 6] = mMat[ 4] * pMat[ 2] + mMat[ 5] * pMat[ 6] + mMat[ 6] * pMat[10] + mMat[ 7] * pMat[14];
        this.clip[ 7] = mMat[ 4] * pMat[ 3] + mMat[ 5] * pMat[ 7] + mMat[ 6] * pMat[11] + mMat[ 7] * pMat[15];

        this.clip[ 8] = mMat[ 8] * pMat[ 0] + mMat[ 9] * pMat[ 4] + mMat[10] * pMat[ 8] + mMat[11] * pMat[12];
        this.clip[ 9] = mMat[ 8] * pMat[ 1] + mMat[ 9] * pMat[ 5] + mMat[10] * pMat[ 9] + mMat[11] * pMat[13];
        this.clip[10] = mMat[ 8] * pMat[ 2] + mMat[ 9] * pMat[ 6] + mMat[10] * pMat[10] + mMat[11] * pMat[14];
        this.clip[11] = mMat[ 8] * pMat[ 3] + mMat[ 9] * pMat[ 7] + mMat[10] * pMat[11] + mMat[11] * pMat[15];

        this.clip[12] = mMat[12] * pMat[ 0] + mMat[13] * pMat[ 4] + mMat[14] * pMat[ 8] + mMat[15] * pMat[12];
        this.clip[13] = mMat[12] * pMat[ 1] + mMat[13] * pMat[ 5] + mMat[14] * pMat[ 9] + mMat[15] * pMat[13];
        this.clip[14] = mMat[12] * pMat[ 2] + mMat[13] * pMat[ 6] + mMat[14] * pMat[10] + mMat[15] * pMat[14];
        this.clip[15] = mMat[12] * pMat[ 3] + mMat[13] * pMat[ 7] + mMat[14] * pMat[11] + mMat[15] * pMat[15];
        
        /* Extract the numbers for the RIGHT plane */
        this.frustum[0][0] = this.clip[ 3] - this.clip[ 0];
        this.frustum[0][1] = this.clip[ 7] - this.clip[ 4];
        this.frustum[0][2] = this.clip[11] - this.clip[ 8];
        this.frustum[0][3] = this.clip[15] - this.clip[12];

        /* Normalize the result */
        t = Math.sqrt(this.frustum[0][0] * this.frustum[0][0] + this.frustum[0][1] * this.frustum[0][1] + this.frustum[0][2] * this.frustum[0][2]);
        this.frustum[0][0] /= t;
        this.frustum[0][1] /= t;
        this.frustum[0][2] /= t;
        this.frustum[0][3] /= t;

        /* Extract the numbers for the LEFT plane */
        this.frustum[1][0] = this.clip[ 3] + this.clip[ 0];
        this.frustum[1][1] = this.clip[ 7] + this.clip[ 4];
        this.frustum[1][2] = this.clip[11] + this.clip[ 8];
        this.frustum[1][3] = this.clip[15] + this.clip[12];

        /* Normalize the result */
        t = Math.sqrt(this.frustum[1][0] * this.frustum[1][0] + this.frustum[1][1] * this.frustum[1][1] + this.frustum[1][2] * this.frustum[1][2]);
        this.frustum[1][0] /= t;
        this.frustum[1][1] /= t;
        this.frustum[1][2] /= t;
        this.frustum[1][3] /= t;

        /* Extract the BOTTOM plane */
        this.frustum[2][0] = this.clip[ 3] + this.clip[ 1];
        this.frustum[2][1] = this.clip[ 7] + this.clip[ 5];
        this.frustum[2][2] = this.clip[11] + this.clip[ 9];
        this.frustum[2][3] = this.clip[15] + this.clip[13];

        /* Normalize the result */
        t = Math.sqrt(this.frustum[2][0] * this.frustum[2][0] + this.frustum[2][1] * this.frustum[2][1] + this.frustum[2][2] * this.frustum[2][2]);
        this.frustum[2][0] /= t;
        this.frustum[2][1] /= t;
        this.frustum[2][2] /= t;
        this.frustum[2][3] /= t;

        /* Extract the TOP plane */
        this.frustum[3][0] = this.clip[ 3] - this.clip[ 1];
        this.frustum[3][1] = this.clip[ 7] - this.clip[ 5];
        this.frustum[3][2] = this.clip[11] - this.clip[ 9];
        this.frustum[3][3] = this.clip[15] - this.clip[13];

        /* Normalize the result */
        t = Math.sqrt(this.frustum[3][0] * this.frustum[3][0] + this.frustum[3][1] * this.frustum[3][1] + this.frustum[3][2] * this.frustum[3][2]);
        this.frustum[3][0] /= t;
        this.frustum[3][1] /= t;
        this.frustum[3][2] /= t;
        this.frustum[3][3] /= t;

        /* Extract the FAR plane */
        this.frustum[4][0] = this.clip[ 3] - this.clip[ 2];
        this.frustum[4][1] = this.clip[ 7] - this.clip[ 6];
        this.frustum[4][2] = this.clip[11] - this.clip[10];
        this.frustum[4][3] = this.clip[15] - this.clip[14];

        /* Normalize the result */
        t = Math.sqrt(this.frustum[4][0] * this.frustum[4][0] + this.frustum[4][1] * this.frustum[4][1] + this.frustum[4][2] * this.frustum[4][2]);
        this.frustum[4][0] /= t;
        this.frustum[4][1] /= t;
        this.frustum[4][2] /= t;
        this.frustum[4][3] /= t;

        /* Extract the NEAR plane */
        this.frustum[5][0] = this.clip[ 3] + this.clip[ 2];
        this.frustum[5][1] = this.clip[ 7] + this.clip[ 6];
        this.frustum[5][2] = this.clip[11] + this.clip[10];
        this.frustum[5][3] = this.clip[15] + this.clip[14];

        /* Normalize the result */
        t = Math.sqrt(this.frustum[5][0] * this.frustum[5][0] + this.frustum[5][1] * this.frustum[5][1] + this.frustum[5][2] * this.frustum[5][2]);
        this.frustum[5][0] /= t;
        this.frustum[5][1] /= t;
        this.frustum[5][2] /= t;
        this.frustum[5][3] /= t;
        
        return this.frustum;
    }
    
    inFrustum (v1, v2) {
        for(let p = 0; p < 6; p++) {
            if(this.frustum[p][0] * v1[0] + this.frustum[p][1] * v1[1] + this.frustum[p][2] * v1[2] + this.frustum[p][3] > -1.0) { continue; }
            if(this.frustum[p][0] * v2[0] + this.frustum[p][1] * v1[1] + this.frustum[p][2] * v1[2] + this.frustum[p][3] > -1.0) { continue; }
            if(this.frustum[p][0] * v1[0] + this.frustum[p][1] * v2[1] + this.frustum[p][2] * v1[2] + this.frustum[p][3] > -1.0) { continue; }
            if(this.frustum[p][0] * v2[0] + this.frustum[p][1] * v2[1] + this.frustum[p][2] * v1[2] + this.frustum[p][3] > -1.0) { continue; }
            if(this.frustum[p][0] * v1[0] + this.frustum[p][1] * v1[1] + this.frustum[p][2] * v2[2] + this.frustum[p][3] > -1.0) { continue; }
            if(this.frustum[p][0] * v2[0] + this.frustum[p][1] * v1[1] + this.frustum[p][2] * v2[2] + this.frustum[p][3] > -1.0) { continue; }
            if(this.frustum[p][0] * v1[0] + this.frustum[p][1] * v2[1] + this.frustum[p][2] * v2[2] + this.frustum[p][3] > -1.0) { continue; }
            if(this.frustum[p][0] * v2[0] + this.frustum[p][1] * v2[1] + this.frustum[p][2] * v2[2] + this.frustum[p][3] > -1.0) { continue; }
            
            return false;
        }
        
        return true;
    }
    
    getFrustumCorners() {
        let points = Array(8);
        
        points[0] = this.getFrustumCorner(this.frustum[4], this.frustum[3], this.frustum[0]);
        points[1] = this.getFrustumCorner(this.frustum[4], this.frustum[3], this.frustum[1]);
        
        points[2] = this.getFrustumCorner(this.frustum[4], this.frustum[2], this.frustum[0]);
        points[3] = this.getFrustumCorner(this.frustum[4], this.frustum[2], this.frustum[1]);
        
        points[4] = this.getFrustumCorner(this.frustum[5], this.frustum[3], this.frustum[0]);
        points[5] = this.getFrustumCorner(this.frustum[5], this.frustum[3], this.frustum[1]);
        
        points[6] = this.getFrustumCorner(this.frustum[5], this.frustum[2], this.frustum[0]);
        points[7] = this.getFrustumCorner(this.frustum[5], this.frustum[2], this.frustum[1]);
        
        return points;
    }
    
    getFrustumCorner(f1, f2, f3) {
        let vf1 = vec3.fromValues(f1[0], f1[1], f1[2]);
        let vf2 = vec3.fromValues(f2[0], f2[1], f2[2]);
        let vf3 = vec3.fromValues(f3[0], f3[1], f3[2]);
        
        let normals = mat3.create();
        
        normals[0] = vf1[0];
        normals[1] = vf1[1];
        normals[2] = vf1[2];
        
        normals[3] = vf2[0];
        normals[4] = vf2[1];
        normals[5] = vf2[2];
        
        normals[6] = vf3[0];
        normals[7] = vf3[1];
        normals[8] = vf3[2];
        
        let det = mat3.determinant(normals);
        let v1 = vec3.create(),
            v2 = vec3.create(),
            v3 = vec3.create();
        
        vec3.cross(v1, vf2, vf3);
        vec3.cross(v2, vf3, vf1);
        vec3.cross(v3, vf1, vf2);
        
        v1[0] *= -f1[3];
        v1[1] *= -f1[3];
        v1[2] *= -f1[3];
        
        v2[0] *= -f2[3];
        v2[1] *= -f2[3];
        v2[2] *= -f2[3];
        
        v3[0] *= -f3[3];
        v3[1] *= -f3[3];
        v3[2] *= -f3[3];
        
        let result = vec3.create();
        vec3.add(result, v1, v2);
        vec3.add(result, result, v3);
        
        result[0] = result[0] / det;
        result[1] = result[1] / det;
        result[2] = result[2] / det;
        
        return result;
    }
};