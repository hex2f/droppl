var _ = {
	gebid : function (gebidin) {
		return document.getElementById(gebidin);
	},
	gebcn : function (gebcnin) {
		return document.getElementsByClassName(gebcnin);
	},
	tstr : function (tstrin) {
		return tstrin.toString();
	},
	redir : function (redir) {
		document.location.href=redir;
	},
	duri : function (duriin) {
		return decodeURI(duriin);
	},
	duric : function (duricin) {
		return decodeURIComponent(duricin);
	},
	euri : function (euriin) {
		return encodeURI(euriin);
	},
	euric : function (euricin) {
		return encodeURIComponent(euricin);
	},
	npf : function (pfin) {
		return parseFloat(pfin);
	},
	npi : function (piin) {
		return parseInt(piin);
	},
	rChrAt : function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
	}
}

var _s = {
	h : function (hobj,hval) {
		hobj.style.height=hval;
	},
	w : function (wobj,wval) {
		wobj.style.width=wval;
	},
	p : function (pobj,pval) {
		pobj.style.position=pval;
	},
	t : function (tobj,tval) {
		tobj.style.top=tval;
	},
	l : function (lobj,lval) {
		lobj.style.left=lval;
	},
	r : function (robj,rval) {
		robj.style.right=rval;
	},
	b : function (bobj,bval) {
		bobj.style.right=rval;
	},
	m : function (mobj,mval) {
		mobj.style.margin=mval;
	},
	ml : function (mlobj,mlval) {
		mlobj.style.marginLeft=mlval;
	},
	mr : function (mrobj,mrval) {
		mrobj.style.marginRight=mrval;
	},
	mt : function (mtobj,mtval) {
		mtobj.style.marginTop=mtval;
	},
	mb : function (mbobj,mbval) {
		mbobj.style.marginBottom=mbval;
	},
	fs : function (fsobj,fsval) {
		fsobj.style.fontSize=fsval;
	},
	ff : function (ffobj,ffval) {
		ffobj.style.fontFamily=ffval;
	},
	bc : function (bcobj,bcval) {
		bcobj.style.backgroundColor=bcval;
	},
	set : function (setobj,setstyle,setvalue) {
		setobj.style[setstyle]=setvalue;
	}
}

var _m = {
	ntp : function (ntpcur,ntptotal) {
		var p = _.npi(((ntpcur / ntptotal) * 100));
		return p;
	},
}

var _c = {
	rgb2hex : function (rgb) {
		rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
		return (rgb && rgb.length === 4) ? "#" +
		("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
		("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
		("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
	},
	rgb2hsl: function (rgb){
			rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
			r = rgb[1], g = rgb[2], b = rgb[3];
			r /= 255, g /= 255, b /= 255;
	    var max = Math.max(r, g, b), min = Math.min(r, g, b);
	    var h, s, l = (max + min) / 2;
	    if(max == min){
	        h = s = 0; // achromatic
	    }else{
	        var d = max - min;
	        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	        switch(max){
	            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	            case g: h = (b - r) / d + 2; break;
	            case b: h = (r - g) / d + 4; break;
	        }
	        h /= 6;
	    }
	    return [h, s, l];
	}
}
