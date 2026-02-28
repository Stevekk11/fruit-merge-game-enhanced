var Rt = Object.defineProperty;
var ht = (e) => {
	throw TypeError(e);
};
var St = (e, t, i) =>
	t in e ? Rt(e, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : (e[t] = i);
var ct = (e, t, i) => St(e, typeof t != 'symbol' ? t + '' : t, i),
	Z = (e, t, i) => t.has(e) || ht('Cannot ' + i);
var s = (e, t, i) => (Z(e, t, 'read from private field'), i ? i.call(e) : t.get(e)),
	u = (e, t, i) =>
		t.has(e)
			? ht('Cannot add the same private member more than once')
			: t instanceof WeakSet
				? t.add(e)
				: t.set(e, i),
	n = (e, t, i, a) => (Z(e, t, 'write to private field'), a ? a.call(e, i) : t.set(e, i), i),
	_ = (e, t, i) => (Z(e, t, 'access private method'), i);
import {
	O as At,
	t as vt,
	P as yt,
	Q as Nt,
	j as Ot,
	R as ft,
	S as ot,
	f as D,
	h as I,
	T as Y,
	b as Dt,
	U as It,
	V as lt,
	W as Lt,
	e as O,
	X as H,
	p as J,
	a as bt,
	Y as z,
	Z as M,
	_ as dt,
	$ as Vt,
	a0 as tt,
	g as mt,
	m as Ft,
	a1 as Pt,
	d as K,
	a2 as G,
	a3 as Ct,
	a4 as Mt,
	a5 as _t,
	a6 as Bt,
	E as Wt,
	a7 as Yt,
	a8 as jt,
	a9 as xt,
	I as Ht,
	aa as qt,
	ab as et,
	ac as Ut,
	ad as $t,
	ae as zt,
	af as st,
	ag as q,
	ah as Gt,
	ai as Qt,
	aj as Xt,
	ak as Zt,
	y as Jt,
	al as Kt,
	am as te,
	A as ee
} from './CCKKAdte.js';
import { b as se } from './CKUyP8mI.js';
function ie(e) {
	let t = 0,
		i = yt(0),
		a;
	return () => {
		At() &&
			(vt(i),
			Nt(
				() => (
					t === 0 && (a = Ot(() => e(() => ft(i)))),
					(t += 1),
					() => {
						ot(() => {
							(t -= 1), t === 0 && (a == null || a(), (a = void 0), ft(i));
						});
					}
				)
			));
	};
}
var re = Wt | Yt | jt;
function ne(e, t, i) {
	new ae(e, t, i);
}
var g, p, j, m, L, E, v, d, w, R, S, V, A, F, N, Q, l, Et, wt, it, U, $, rt;
class ae {
	constructor(t, i, a) {
		u(this, l);
		ct(this, 'parent');
		u(this, g, !1);
		u(this, p);
		u(this, j, I ? D : null);
		u(this, m);
		u(this, L);
		u(this, E);
		u(this, v, null);
		u(this, d, null);
		u(this, w, null);
		u(this, R, null);
		u(this, S, null);
		u(this, V, 0);
		u(this, A, 0);
		u(this, F, !1);
		u(this, N, null);
		u(
			this,
			Q,
			ie(
				() => (
					n(this, N, yt(s(this, V))),
					() => {
						n(this, N, null);
					}
				)
			)
		);
		n(this, p, t),
			n(this, m, i),
			n(this, L, a),
			(this.parent = Y.b),
			n(this, g, !!s(this, m).pending),
			n(
				this,
				E,
				Dt(() => {
					if (((Y.b = this), I)) {
						const r = s(this, j);
						It(),
							r.nodeType === lt && r.data === Lt
								? _(this, l, wt).call(this)
								: _(this, l, Et).call(this);
					} else {
						var o = _(this, l, it).call(this);
						try {
							n(
								this,
								v,
								O(() => a(o))
							);
						} catch (r) {
							this.error(r);
						}
						s(this, A) > 0 ? _(this, l, $).call(this) : n(this, g, !1);
					}
					return () => {
						var r;
						(r = s(this, S)) == null || r.remove();
					};
				}, re)
			),
			I && n(this, p, D);
	}
	is_pending() {
		return s(this, g) || (!!this.parent && this.parent.is_pending());
	}
	has_pending_snippet() {
		return !!s(this, m).pending;
	}
	update_pending_count(t) {
		_(this, l, rt).call(this, t),
			n(this, V, s(this, V) + t),
			s(this, N) && Pt(s(this, N), s(this, V));
	}
	get_effect_pending() {
		return s(this, Q).call(this), vt(s(this, N));
	}
	error(t) {
		var i = s(this, m).onerror;
		let a = s(this, m).failed;
		if (s(this, F) || (!i && !a)) throw t;
		s(this, v) && (K(s(this, v)), n(this, v, null)),
			s(this, d) && (K(s(this, d)), n(this, d, null)),
			s(this, w) && (K(s(this, w)), n(this, w, null)),
			I && (G(s(this, j)), Ct(), G(Mt()));
		var o = !1,
			r = !1;
		const c = () => {
			if (o) {
				xt();
				return;
			}
			(o = !0),
				r && Bt(),
				H.ensure(),
				n(this, V, 0),
				s(this, w) !== null &&
					J(s(this, w), () => {
						n(this, w, null);
					}),
				n(this, g, this.has_pending_snippet()),
				n(
					this,
					v,
					_(this, l, U).call(
						this,
						() => (n(this, F, !1), O(() => s(this, L).call(this, s(this, p))))
					)
				),
				s(this, A) > 0 ? _(this, l, $).call(this) : n(this, g, !1);
		};
		var b = tt;
		try {
			M(null), (r = !0), i == null || i(t, c), (r = !1);
		} catch (y) {
			_t(y, s(this, E) && s(this, E).parent);
		} finally {
			M(b);
		}
		a &&
			ot(() => {
				n(
					this,
					w,
					_(this, l, U).call(this, () => {
						H.ensure(), n(this, F, !0);
						try {
							return O(() => {
								a(
									s(this, p),
									() => t,
									() => c
								);
							});
						} catch (y) {
							return _t(y, s(this, E).parent), null;
						} finally {
							n(this, F, !1);
						}
					})
				);
			});
	}
}
(g = new WeakMap()),
	(p = new WeakMap()),
	(j = new WeakMap()),
	(m = new WeakMap()),
	(L = new WeakMap()),
	(E = new WeakMap()),
	(v = new WeakMap()),
	(d = new WeakMap()),
	(w = new WeakMap()),
	(R = new WeakMap()),
	(S = new WeakMap()),
	(V = new WeakMap()),
	(A = new WeakMap()),
	(F = new WeakMap()),
	(N = new WeakMap()),
	(Q = new WeakMap()),
	(l = new WeakSet()),
	(Et = function () {
		try {
			n(
				this,
				v,
				O(() => s(this, L).call(this, s(this, p)))
			);
		} catch (t) {
			this.error(t);
		}
		n(this, g, !1);
	}),
	(wt = function () {
		const t = s(this, m).pending;
		t &&
			(n(
				this,
				d,
				O(() => t(s(this, p)))
			),
			H.enqueue(() => {
				var i = _(this, l, it).call(this);
				n(
					this,
					v,
					_(this, l, U).call(this, () => (H.ensure(), O(() => s(this, L).call(this, i))))
				),
					s(this, A) > 0
						? _(this, l, $).call(this)
						: (J(s(this, d), () => {
								n(this, d, null);
							}),
							n(this, g, !1));
			}));
	}),
	(it = function () {
		var t = s(this, p);
		return s(this, g) && (n(this, S, bt()), s(this, p).before(s(this, S)), (t = s(this, S))), t;
	}),
	(U = function (t) {
		var i = Y,
			a = tt,
			o = mt;
		z(s(this, E)), M(s(this, E)), dt(s(this, E).ctx);
		try {
			return t();
		} catch (r) {
			return Vt(r), null;
		} finally {
			z(i), M(a), dt(o);
		}
	}),
	($ = function () {
		const t = s(this, m).pending;
		s(this, v) !== null &&
			(n(this, R, document.createDocumentFragment()),
			s(this, R).append(s(this, S)),
			Ft(s(this, v), s(this, R))),
			s(this, d) === null &&
				n(
					this,
					d,
					O(() => t(s(this, p)))
				);
	}),
	(rt = function (t) {
		var i;
		if (!this.has_pending_snippet()) {
			this.parent && _((i = this.parent), l, rt).call(i, t);
			return;
		}
		n(this, A, s(this, A) + t),
			s(this, A) === 0 &&
				(n(this, g, !1),
				s(this, d) &&
					J(s(this, d), () => {
						n(this, d, null);
					}),
				s(this, R) && (s(this, p).before(s(this, R)), n(this, R, null)));
	});
function pe(e) {
	return e.endsWith('capture') && e !== 'gotpointercapture' && e !== 'lostpointercapture';
}
const oe = [
	'beforeinput',
	'click',
	'change',
	'dblclick',
	'contextmenu',
	'focusin',
	'focusout',
	'input',
	'keydown',
	'keyup',
	'mousedown',
	'mousemove',
	'mouseout',
	'mouseover',
	'mouseup',
	'pointerdown',
	'pointermove',
	'pointerout',
	'pointerover',
	'pointerup',
	'touchend',
	'touchmove',
	'touchstart'
];
function ge(e) {
	return oe.includes(e);
}
const le = {
	formnovalidate: 'formNoValidate',
	ismap: 'isMap',
	nomodule: 'noModule',
	playsinline: 'playsInline',
	readonly: 'readOnly',
	defaultvalue: 'defaultValue',
	defaultchecked: 'defaultChecked',
	srcobject: 'srcObject',
	novalidate: 'noValidate',
	allowfullscreen: 'allowFullscreen',
	disablepictureinpicture: 'disablePictureInPicture',
	disableremoteplayback: 'disableRemotePlayback'
};
function ve(e) {
	return (e = e.toLowerCase()), le[e] ?? e;
}
const ue = ['touchstart', 'touchmove'];
function he(e) {
	return ue.includes(e);
}
const Tt = new Set(),
	nt = new Set();
function ye(e, t, i, a = {}) {
	function o(r) {
		if ((a.capture || W.call(t, r), !r.cancelBubble))
			return qt(() => (i == null ? void 0 : i.call(this, r)));
	}
	return (
		e.startsWith('pointer') || e.startsWith('touch') || e === 'wheel'
			? ot(() => {
					t.addEventListener(e, o, a);
				})
			: t.addEventListener(e, o, a),
		o
	);
}
function be(e) {
	for (var t = 0; t < e.length; t++) Tt.add(e[t]);
	for (var i of nt) i(e);
}
let pt = null;
function W(e) {
	var ut;
	var t = this,
		i = t.ownerDocument,
		a = e.type,
		o = ((ut = e.composedPath) == null ? void 0 : ut.call(e)) || [],
		r = o[0] || e.target;
	pt = e;
	var c = 0,
		b = pt === e && e.__root;
	if (b) {
		var y = o.indexOf(b);
		if (y !== -1 && (t === document || t === window)) {
			e.__root = t;
			return;
		}
		var P = o.indexOf(t);
		if (P === -1) return;
		y <= P && (c = y);
	}
	if (((r = o[c] || e.target), r !== t)) {
		Ht(e, 'currentTarget', {
			configurable: !0,
			get() {
				return r || i;
			}
		});
		var X = tt,
			T = Y;
		M(null), z(null);
		try {
			for (var h, f = []; r !== null; ) {
				var k = r.assignedSlot || r.parentNode || r.host || null;
				try {
					var B = r['__' + a];
					B != null && (!r.disabled || e.target === r) && B.call(r, e);
				} catch (x) {
					h ? f.push(x) : (h = x);
				}
				if (e.cancelBubble || k === t || k === null) break;
				r = k;
			}
			if (h) {
				for (let x of f)
					queueMicrotask(() => {
						throw x;
					});
				throw h;
			}
		} finally {
			(e.__root = t), delete e.currentTarget, M(X), z(T);
		}
	}
}
let gt = !0;
function me(e, t) {
	var i = t == null ? '' : typeof t == 'object' ? t + '' : t;
	i !== (e.__t ?? (e.__t = e.nodeValue)) && ((e.__t = i), (e.nodeValue = i + ''));
}
function ce(e, t) {
	return kt(e, t);
}
function Ee(e, t) {
	et(), (t.intro = t.intro ?? !1);
	const i = t.target,
		a = I,
		o = D;
	try {
		for (var r = Ut(i); r && (r.nodeType !== lt || r.data !== $t); ) r = zt(r);
		if (!r) throw st;
		q(!0), G(r);
		const c = kt(e, { ...t, anchor: r });
		return q(!1), c;
	} catch (c) {
		if (
			c instanceof Error &&
			c.message
				.split(`
`)
				.some((b) => b.startsWith('https://svelte.dev/e/'))
		)
			throw c;
		return (
			c !== st && console.warn('Failed to hydrate: ', c),
			t.recover === !1 && Gt(),
			et(),
			Qt(i),
			q(!1),
			ce(e, t)
		);
	} finally {
		q(a), G(o);
	}
}
const C = new Map();
function kt(e, { target: t, anchor: i, props: a = {}, events: o, context: r, intro: c = !0 }) {
	et();
	var b = new Set(),
		y = (T) => {
			for (var h = 0; h < T.length; h++) {
				var f = T[h];
				if (!b.has(f)) {
					b.add(f);
					var k = he(f);
					t.addEventListener(f, W, { passive: k });
					var B = C.get(f);
					B === void 0
						? (document.addEventListener(f, W, { passive: k }), C.set(f, 1))
						: C.set(f, B + 1);
				}
			}
		};
	y(Xt(Tt)), nt.add(y);
	var P = void 0,
		X = Zt(() => {
			var T = i ?? t.appendChild(bt());
			return (
				ne(T, { pending: () => {} }, (h) => {
					if (r) {
						Jt({});
						var f = mt;
						f.c = r;
					}
					if (
						(o && (a.$$events = o),
						I && se(h, null),
						(gt = c),
						(P = e(h, a) || {}),
						(gt = !0),
						I && ((Y.nodes_end = D), D === null || D.nodeType !== lt || D.data !== Kt))
					)
						throw (te(), st);
					r && ee();
				}),
				() => {
					var k;
					for (var h of b) {
						t.removeEventListener(h, W);
						var f = C.get(h);
						--f === 0 ? (document.removeEventListener(h, W), C.delete(h)) : C.set(h, f);
					}
					nt.delete(y), T !== i && ((k = T.parentNode) == null || k.removeChild(T));
				}
			);
		});
	return at.set(P, X), P;
}
let at = new WeakMap();
function we(e, t) {
	const i = at.get(e);
	return i ? (at.delete(e), i(t)) : Promise.resolve();
}
export { ge as a, gt as b, ye as c, be as d, Ee as h, pe as i, ce as m, ve as n, me as s, we as u };
