// [1.20.1] 특정 구역 진입 시 자동 텔레포트 스크립트
PlayerEvents.tick(event => {
    const { player, server } = event;

    if (server.tickCount % 25 !== 0) return;

    // 1. 감지할 구역 좌표 (x, y, z)
    let targetX = -468;
    let targetY = 67;
    let targetZ = 1676;

    // 2. 플레이어와 목표 지점 사이의 거리 계산 (오차 범위 1.5 블록)
    if (player.getDistanceSq(targetX, targetY, targetZ) < 1.5) {

        // 3. 이동할 목적지 좌표
        player.teleportTo(-241, 65, -769);

        // 4. 효과 및 메시지
        player.tell(Text.of("🌀 차원 이동 구역을 통과했습니다!").lightPurple());
        server.runCommandSilent(`execute at ${player.username} run playsound minecraft:entity.enderman.teleport player @a ~ ~ ~ 1 1`);
    }
});



PlayerEvents.tick(event => {
    const { player, server } = event;

    if (server.tickCount % 25 !== 0) return;

    // 1. 감지할 구역 좌표 (x, y, z)
    // 포탈 블록이나 문이 있는 위치를 입력하세요.
    let targetX = -241;
    let targetY = 62;
    let targetZ = -744;

    // 2. 플레이어와 목표 지점 사이의 거리 계산 (오차 범위 1.5 블록)
    if (player.getDistanceSq(targetX, targetY, targetZ) < 1.5) {

        // 3. 이동할 목적지 좌표
        player.teleportTo(-464, 66, 1676);

        // 4. 효과 및 메시지
        player.tell(Text.of("🌀 차원 이동 구역을 통과했습니다!").lightPurple());
        server.runCommandSilent(`execute at ${player.username} run playsound minecraft:entity.enderman.teleport player @a ~ ~ ~ 1 1`);
    }
});

