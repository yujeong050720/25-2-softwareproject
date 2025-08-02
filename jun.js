// gun.js
// P2P Signaling/Relay 서버 (Node.js)

const express = require('express');
const http = require('http');
const Gun = require('gun');

// Express 앱 생성
const app = express();

// Gun 정적 파일 서빙 및 CORS 허용
app.use(require('cors')());
app.use(Gun.serve);

// HTTP 서버 생성 및 Gun 연동
const server = http.createServer(app);
Gun({ web: server, file: 'data' });

// 서버 시작
const PORT = process.env.PORT || 8765;
server.listen(PORT, () => {
  console.log(`Gun relay server listening on http://localhost:${PORT}`);
});
