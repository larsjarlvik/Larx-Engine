Larx.Frustum =  {
    clip: Array(16),
    frustum: Array(6),
    
    init: function() {
        for(var i = 0; i < this.frustum.length; i++) {
            this.frustum[i] = new Array(4);
        }
    },
    
    extractFrustum: function() {
        var mMat = Larx.Matrix.mvMatrix;
        var pMat = Larx.Matrix.pMatrix;
        var t;

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
    },
    
    inFrustum: function(v1, v2) {
        for(var p = 0; p < 6; p++) {
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
};