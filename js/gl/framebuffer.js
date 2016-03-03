var Framebuffer = function(ctx, width, height) {
    this.ctx = ctx;
    
    this.width = width;
    this.height = height;
    
    this.framebuffer = ctx.gl.createFramebuffer();
    this.renderbuffer = ctx.gl.createRenderbuffer();
    
    this.colorTexture;
    this.depthTexture;
    
    this.build();
};

Framebuffer.prototype.build = function() {
    var gl = this.ctx.gl;
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
    
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

Framebuffer.prototype.buildColorBuffer = function(format) {
    var gl = this.ctx.gl;
    this.colorTexture = gl.createTexture();
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    
    gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, format, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorTexture, 0);
        
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

Framebuffer.prototype.buildDepthBuffer = function() {
    var gl = this.ctx.gl;
    this.depthTexture = gl.createTexture();
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    
    gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, this.width, this.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);


    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
};

Framebuffer.prototype.bind = function() {
    this.ctx.gl.bindFramebuffer(this.ctx.gl.FRAMEBUFFER, this.framebuffer);
    this.ctx.gl.clear(this.ctx.gl.COLOR_BUFFER_BIT | this.ctx.gl.DEPTH_BUFFER_BIT);
    
    this.ctx.gl.viewport(0, 0, this.width, this.height);
    
    if(this.colorTexture) { 
        this.ctx.gl.framebufferTexture2D(this.ctx.gl.FRAMEBUFFER, this.ctx.gl.COLOR_ATTACHMENT0, this.ctx.gl.TEXTURE_2D, this.colorTexture, 0);
    }
    
    if(this.depthTexture) { 
        this.ctx.gl.framebufferTexture2D(this.ctx.gl.FRAMEBUFFER, this.ctx.gl.DEPTH_ATTACHMENT, this.ctx.gl.TEXTURE_2D, this.depthTexture, 0);
    }
};

Framebuffer.prototype.unbind = function() {
    this.ctx.gl.viewport(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.gl.bindFramebuffer(this.ctx.gl.FRAMEBUFFER, null);
};

Framebuffer.prototype.bindColorTexture = function(textureUnit) {
    this.ctx.gl.activeTexture(textureUnit);
    this.ctx.gl.bindTexture(this.ctx.gl.TEXTURE_2D, this.colorTexture);  
};

Framebuffer.prototype.bindDepthTexture = function(textureUnit) {
    this.ctx.gl.activeTexture(textureUnit);
    this.ctx.gl.bindTexture(this.ctx.gl.TEXTURE_2D, this.depthTexture);  
};

Framebuffer.prototype.unbindTextures = function() {
    this.ctx.gl.bindTexture(this.ctx.gl.TEXTURE_2D, null);  
}