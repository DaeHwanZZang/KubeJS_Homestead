// [1.20.1] 특정 구역 채굴 및 설치 완벽 차단 스크립트

// 1. 블록 설치 방지 (이벤트 기반)
BlockEvents.placed(event => {
    const { block, player, server } = event;
    
    // 보호할 중심 좌표와 반경
    let targetX = -240;
    let targetY = 65;
    let targetZ = -752;
    let radiusSq = 5400;

    if (player.getDistanceSq(targetX, targetY, targetZ) < radiusSq) {
        // 관리자(OP)는 설치할 수 있게 예외 처리
        if (!player.op) {
            event.cancel(); // 설치 취소
            player.statusMessage = Text.red("⚠ 이 구역에서는 블록을 설치할 수 없습니다!");
        }
    }
});

// 2. 채굴 피로 적용 (틱 기반 - 기존 로직)
PlayerEvents.tick(event => {
    const { player, server } = event;
    if (server.tickCount % 50 !== 0) return;

    let targetX = -240;
    let targetY = 65;
    let targetZ = -752;
    let radiusSq = 5400;

    if (player.getDistanceSq(targetX, targetY, targetZ) < radiusSq) {
        if (!player.op) {
            player.potionEffects.add('minecraft:mining_fatigue', 25, 4, false, false);
        }
    }
});
