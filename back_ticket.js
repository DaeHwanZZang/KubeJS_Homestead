// [1.20.1] 귀환권 최종 안정화 버전 (NBT 태그 검사 방식)
ItemEvents.rightClicked('minecraft:paper', event => {
    const { player, server, item } = event;

    // 아이템에 'back_ticket'이라는 커스텀 데이터가 있는지 확인
    if (item.nbt && item.nbt.back_ticket === 1) {
        
        // 1. /back 명령어 실행
        server.runCommandSilent(`execute as ${player.username} run back`);
        
        // 2. 아이템 1개 소모
        item.count--;
        
        // 3. 피드백
        player.tell(Text.aqua("✨ 마지막 사망 지점으로 이동했습니다!"));
        server.runCommandSilent(`execute at ${player.username} run playsound minecraft:item.chorus_fruit.teleport player @a ~ ~ ~`);
        
        // 4. 이벤트 취소
        event.cancel();
    }
});
