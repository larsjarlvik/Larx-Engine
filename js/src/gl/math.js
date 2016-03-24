class LarxMath {
	degToRad(degrees) {
		return degrees * Math.PI / 180;
	}
	
	radToDeg(degrees) {
		return degrees / Math.PI * 180;
	}
	
	baryCentric(p1, p2, p3, pos) {
		var det = (p2[2] - p3[2]) * (p1[0] - p3[0]) + (p3[0] - p2[0]) * (p1[2] - p3[2]);
		var l1 = ((p2[2] - p3[2]) * (pos[0] - p3[0]) + (p3[0] - p2[0]) * (pos[1] - p3[2])) / det;
		var l2 = ((p3[2] - p1[2]) * (pos[0] - p3[0]) + (p1[0] - p3[0]) * (pos[1] - p3[2])) / det;
		var l3 = 1.0 - l1 - l2;
		
		return l1 * p1[1] + l2 * p2[1] + l3 * p3[1];
	}
}