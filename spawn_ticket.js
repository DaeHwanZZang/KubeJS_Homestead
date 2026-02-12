// [1.20.1] 스폰 귀환권(스폰 지점 이동) 아이템 스크립트
ItemEvents.rightClicked('minecraft:paper', event => {
    const { player, server, item } = event;

    // 아이템에 'spawn_ticket'이라는 커스텀 데이터가 있는지 확인
    if (item.nbt && item.nbt.spawn_ticket === 1) {
        
        // 1. FTB Essentials의 /spawn 명령어 실행
        server.runCommandSilent(`execute as ${player.username} run spawn`);
        
        // 2. 아이템 1개 소모
        item.count--;
        
        // 3. 피드백 (효과음과 메시지)
        player.tell(Text.of("🏠 마을 스폰 지점으로 이동했습니다!").green());
        server.runCommandSilent(`execute at ${player.username} run playsound minecraft:entity.enderman.teleport player @a ~ ~ ~ 1 1`);
        
        // 4. 이벤트 취소
        event.cancel();
    }
});
