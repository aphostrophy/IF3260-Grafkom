import { MathUtils } from "@math/MathUtils";
import { Matrix4 } from "@math/Matrix4";

export function getOblique(pMtrx:Matrix4, theta:number, phi:number){
	
	if(!pMtrx){
		pMtrx = new Matrix4();
	}

	var t = MathUtils.degToRad(theta);
	var p = MathUtils.degToRad(phi);

	var cotT = -1/Math.tan(t);
	var cotP = -1/Math.tan(p);
	
	pMtrx.elements[0] = 1;
	pMtrx.elements[1] = 0;
	pMtrx.elements[2] = cotT;
	pMtrx.elements[3] = 0;
	pMtrx.elements[4] = 0;
	pMtrx.elements[5] = 1;
	pMtrx.elements[6] = cotP;
	pMtrx.elements[7] = 0;
	pMtrx.elements[8] = 0;
	pMtrx.elements[9] = 0;
	pMtrx.elements[10] = 1;
	pMtrx.elements[11] = 0;
	pMtrx.elements[12] = 0
	pMtrx.elements[13] = 0
	pMtrx.elements[14] = 0
	pMtrx.elements[15] = 1;
	
	pMtrx.transpose();
	
	return pMtrx;	
};

export function getOrtho(left:number, right:number, bottom:number, top:number, near:number, far:number, pMtrx:Matrix4){
	
	if(!pMtrx){
		pMtrx = new Matrix4();
	}

	var a = right - left;
	var b = top - bottom;
	var c = far - near;
	
	pMtrx.elements[0] = 2/a;
	pMtrx.elements[1] = 0;
	pMtrx.elements[2] = 0;
	pMtrx.elements[3] = 0;
	pMtrx.elements[4] = 0;
	pMtrx.elements[5] = 2/b;
	pMtrx.elements[6] = 0;
	pMtrx.elements[7] = 0;
	pMtrx.elements[8] = 0;
	pMtrx.elements[9] = 0;
	pMtrx.elements[10] = -2/c;
	pMtrx.elements[11] = 0;
	pMtrx.elements[12] = -1*(left + right)/a;
	pMtrx.elements[13] = -1*(top + bottom)/b;
	pMtrx.elements[14] = -1*(far + near )/c;
	pMtrx.elements[15] = 1;
	
	return pMtrx;
};

