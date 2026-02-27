
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/inicio",
    "route": "/"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-6ZWTCCPX.js",
      "chunk-CVBZXMRQ.js"
    ],
    "route": "/inicio"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-O4HB23AG.js",
      "chunk-CVBZXMRQ.js",
      "chunk-SVTFRASV.js"
    ],
    "route": "/mantenimiento"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-O4HB23AG.js",
      "chunk-CVBZXMRQ.js",
      "chunk-SVTFRASV.js"
    ],
    "route": "/mantenimiento/*"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-7EYBPSQE.js",
      "chunk-SVTFRASV.js"
    ],
    "route": "/vistaMantenimiento"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 24673, hash: 'a112aaef5a9a94ced3df18a8084e207005d6e1a07f3a778572866e8f16047278', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 17183, hash: 'c55200972e2380098ba7b853fb66c73b8c6bebf1e57299315f362da82394cbb2', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'inicio/index.html': {size: 43444, hash: '55cb5b6f0628abc362c5ae65e57cbff2b37ca3eb33908042110ebbd3cfa80fa5', text: () => import('./assets-chunks/inicio_index_html.mjs').then(m => m.default)},
    'styles-OPUTW5UJ.css': {size: 8043, hash: 'i68XcmjPijU', text: () => import('./assets-chunks/styles-OPUTW5UJ_css.mjs').then(m => m.default)}
  },
};
