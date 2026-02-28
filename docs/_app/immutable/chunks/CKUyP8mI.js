import {
	a as c,
	ac as u,
	an as h,
	T as v,
	ao as E,
	ap as T,
	h as i,
	f as s,
	aq as g,
	U as N,
	ar as y,
	a2 as w,
	as as x
} from './CCKKAdte.js';
function p(r) {
	var a = document.createElement('template');
	return (a.innerHTML = r.replaceAll('<!>', '<!---->')), a.content;
}
function n(r, a) {
	var e = v;
	e.nodes_start === null && ((e.nodes_start = r), (e.nodes_end = a));
}
function C(r, a) {
	var e = (a & E) !== 0,
		_ = (a & T) !== 0,
		t,
		d = !r.startsWith('<!>');
	return () => {
		if (i) return n(s, null), s;
		t === void 0 && ((t = p(d ? r : '<!>' + r)), e || (t = u(t)));
		var o = _ || h ? document.importNode(t, !0) : t.cloneNode(!0);
		if (e) {
			var l = u(o),
				f = o.lastChild;
			n(l, f);
		} else n(o, o);
		return o;
	};
}
function A(r, a, e = 'svg') {
	var _ = !r.startsWith('<!>'),
		t = `<${e}>${_ ? r : '<!>' + r}</${e}>`,
		d;
	return () => {
		if (i) return n(s, null), s;
		if (!d) {
			var o = p(t),
				l = u(o);
			d = u(l);
		}
		var f = d.cloneNode(!0);
		return n(f, f), f;
	};
}
function F(r, a) {
	return A(r, a, 'svg');
}
function L(r = '') {
	if (!i) {
		var a = c(r + '');
		return n(a, a), a;
	}
	var e = s;
	return e.nodeType !== y && (e.before((e = c())), w(e)), n(e, e), e;
}
function O() {
	if (i) return n(s, null), s;
	var r = document.createDocumentFragment(),
		a = document.createComment(''),
		e = c();
	return r.append(a, e), n(a, e), r;
}
function P(r, a) {
	if (i) {
		var e = v;
		((e.f & g) === 0 || e.nodes_end === null) && (e.nodes_end = s), N();
		return;
	}
	r !== null && r.before(a);
}
const M = '5';
var m;
typeof window < 'u' &&
	((m = window.__svelte ?? (window.__svelte = {})).v ?? (m.v = new Set())).add(M);
x();
export { P as a, n as b, O as c, p as d, F as e, C as f, L as t };
