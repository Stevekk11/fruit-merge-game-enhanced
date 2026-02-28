import {
	b as j,
	h as m,
	U as C,
	E as U,
	at as K,
	W as z,
	a4 as G,
	a2 as H,
	ag as x,
	au as W,
	Q as M,
	j as Y,
	S as Q,
	av as g,
	T as A,
	P as Z,
	aw as I,
	Y as L,
	ax as N,
	t as w,
	ay as S,
	L as $,
	az as R,
	aA as J,
	w as V,
	aB as X,
	aC as k,
	F as ee,
	aD as re,
	aE as ne,
	aF as te,
	aG as se,
	i as ie,
	aH as ae,
	aI as ue
} from './CCKKAdte.js';
import { B as q } from './DvkRHcLg.js';
function he(e, r, t = !1) {
	m && C();
	var n = new q(e),
		s = t ? U : 0;
	function i(f, a) {
		if (m) {
			const v = K(e) === z;
			if (f === v) {
				var l = G();
				H(l), (n.anchor = l), x(!1), n.ensure(f, a), x(!0);
				return;
			}
		}
		n.ensure(f, a);
	}
	j(() => {
		var f = !1;
		r((a, l = !0) => {
			(f = !0), i(l, a);
		}),
			f || i(!1, null);
	}, s);
}
function Pe(e, r, t) {
	m && C();
	var n = new q(e);
	j(() => {
		var s = r() ?? null;
		n.ensure(s, s && ((i) => t(i, s)));
	}, U);
}
function B(e, r) {
	return e === r || (e == null ? void 0 : e[g]) === r;
}
function Se(e = {}, r, t, n) {
	return (
		W(() => {
			var s, i;
			return (
				M(() => {
					(s = i),
						(i = []),
						Y(() => {
							e !== t(...i) && (r(e, ...i), s && B(t(...s), e) && r(null, ...s));
						});
				}),
				() => {
					Q(() => {
						i && B(t(...i), e) && r(null, ...i);
					});
				}
			);
		}),
		e
	);
}
let b = !1;
function fe(e) {
	var r = b;
	try {
		return (b = !1), [e(), b];
	} finally {
		b = r;
	}
}
const le = {
	get(e, r) {
		if (!e.exclude.includes(r)) return w(e.version), r in e.special ? e.special[r]() : e.props[r];
	},
	set(e, r, t) {
		if (!(r in e.special)) {
			var n = A;
			try {
				L(e.parent_effect),
					(e.special[r] = ce(
						{
							get [r]() {
								return e.props[r];
							}
						},
						r,
						N
					));
			} finally {
				L(n);
			}
		}
		return e.special[r](t), I(e.version), !0;
	},
	getOwnPropertyDescriptor(e, r) {
		if (!e.exclude.includes(r) && r in e.props)
			return { enumerable: !0, configurable: !0, value: e.props[r] };
	},
	deleteProperty(e, r) {
		return e.exclude.includes(r) || (e.exclude.push(r), I(e.version)), !0;
	},
	has(e, r) {
		return e.exclude.includes(r) ? !1 : r in e.props;
	},
	ownKeys(e) {
		return Reflect.ownKeys(e.props).filter((r) => !e.exclude.includes(r));
	}
};
function Ee(e, r) {
	return new Proxy({ props: e, exclude: r, special: {}, version: Z(0), parent_effect: A }, le);
}
const oe = {
	get(e, r) {
		let t = e.props.length;
		for (; t--; ) {
			let n = e.props[t];
			if ((S(n) && (n = n()), typeof n == 'object' && n !== null && r in n)) return n[r];
		}
	},
	set(e, r, t) {
		let n = e.props.length;
		for (; n--; ) {
			let s = e.props[n];
			S(s) && (s = s());
			const i = R(s, r);
			if (i && i.set) return i.set(t), !0;
		}
		return !1;
	},
	getOwnPropertyDescriptor(e, r) {
		let t = e.props.length;
		for (; t--; ) {
			let n = e.props[t];
			if ((S(n) && (n = n()), typeof n == 'object' && n !== null && r in n)) {
				const s = R(n, r);
				return s && !s.configurable && (s.configurable = !0), s;
			}
		}
	},
	has(e, r) {
		if (r === g || r === $) return !1;
		for (let t of e.props) if ((S(t) && (t = t()), t != null && r in t)) return !0;
		return !1;
	},
	ownKeys(e) {
		const r = [];
		for (let t of e.props)
			if ((S(t) && (t = t()), !!t)) {
				for (const n in t) r.includes(n) || r.push(n);
				for (const n of Object.getOwnPropertySymbols(t)) r.includes(n) || r.push(n);
			}
		return r;
	}
};
function be(...e) {
	return new Proxy({ props: e }, oe);
}
function ce(e, r, t, n) {
	var O;
	var s = !ie || (t & ae) !== 0,
		i = (t & se) !== 0,
		f = (t & te) !== 0,
		a = n,
		l = !0,
		v = () => (l && ((l = !1), (a = f ? Y(n) : n)), a),
		u;
	if (i) {
		var p = g in e || $ in e;
		u = ((O = R(e, r)) == null ? void 0 : O.set) ?? (p && r in e ? (c) => (e[r] = c) : void 0);
	}
	var d,
		y = !1;
	i ? ([d, y] = fe(() => e[r])) : (d = e[r]),
		d === void 0 && n !== void 0 && ((d = v()), u && (s && J(), u(d)));
	var o;
	if (
		(s
			? (o = () => {
					var c = e[r];
					return c === void 0 ? v() : ((l = !0), c);
				})
			: (o = () => {
					var c = e[r];
					return c !== void 0 && (a = void 0), c === void 0 ? a : c;
				}),
		s && (t & N) === 0)
	)
		return o;
	if (u) {
		var h = e.$$legacy;
		return function (c, E) {
			return arguments.length > 0 ? ((!s || !E || h || y) && u(E ? o() : c), c) : o();
		};
	}
	var _ = !1,
		P = ((t & ue) !== 0 ? V : X)(() => ((_ = !1), o()));
	i && w(P);
	var F = A;
	return function (c, E) {
		if (arguments.length > 0) {
			const T = E ? w(P) : s && i ? k(c) : c;
			return ee(P, T), (_ = !0), a !== void 0 && (a = T), c;
		}
		return (re && _) || (F.f & ne) !== 0 ? P.v : w(P);
	};
}
const de = 'modulepreload',
	pe = function (e, r) {
		return new URL(e, r).href;
	},
	D = {},
	we = function (r, t, n) {
		let s = Promise.resolve();
		if (t && t.length > 0) {
			let f = function (u) {
				return Promise.all(
					u.map((p) =>
						Promise.resolve(p).then(
							(d) => ({ status: 'fulfilled', value: d }),
							(d) => ({ status: 'rejected', reason: d })
						)
					)
				);
			};
			const a = document.getElementsByTagName('link'),
				l = document.querySelector('meta[property=csp-nonce]'),
				v = (l == null ? void 0 : l.nonce) || (l == null ? void 0 : l.getAttribute('nonce'));
			s = f(
				t.map((u) => {
					if (((u = pe(u, n)), u in D)) return;
					D[u] = !0;
					const p = u.endsWith('.css'),
						d = p ? '[rel="stylesheet"]' : '';
					if (!!n)
						for (let h = a.length - 1; h >= 0; h--) {
							const _ = a[h];
							if (_.href === u && (!p || _.rel === 'stylesheet')) return;
						}
					else if (document.querySelector(`link[href="${u}"]${d}`)) return;
					const o = document.createElement('link');
					if (
						((o.rel = p ? 'stylesheet' : de),
						p || (o.as = 'script'),
						(o.crossOrigin = ''),
						(o.href = u),
						v && o.setAttribute('nonce', v),
						document.head.appendChild(o),
						p)
					)
						return new Promise((h, _) => {
							o.addEventListener('load', h),
								o.addEventListener('error', () => _(new Error(`Unable to preload CSS for ${u}`)));
						});
				})
			);
		}
		function i(f) {
			const a = new Event('vite:preloadError', { cancelable: !0 });
			if (((a.payload = f), window.dispatchEvent(a), !a.defaultPrevented)) throw f;
		}
		return s.then((f) => {
			for (const a of f || []) a.status === 'rejected' && i(a.reason);
			return r().catch(i);
		});
	};
export { we as _, Se as b, Pe as c, he as i, Ee as l, ce as p, be as s };
