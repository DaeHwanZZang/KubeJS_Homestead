// ==========================================
// [설정] 1. 와인 기본 가격
// ==========================================
const WINE_MARKET_DB = {
    'vinery:eiswein': 4,
    'vinery:noir_wine': 4,
    'vinery:kelp_cider': 4,
    'vinery:apple_cider': 4,
    'vinery:clark_wine': 4,
    'vinery:stal_wine': 4,
    'vinery:glowing_wine': 4,
    'vinery:creepers_crush': 4,
    'vinery:villagers_fright': 4,
    'vinery:magnetic_wine': 4,
    'vinery:strad_wine': 4,
    'vinery:jo_special_mixture': 6,
    'vinery:chenet_wine': 8,
    'vinery:aegis_wine': 8,
    'vinery:bolvar_wine': 8,
    'vinery:lilitu_wine': 8,
    'vinery:solaris_wine': 8,
    'vinery:mead': 8,
    'vinery:apple_wine': 8,
    'vinery:cristel_wine': 12,
    'vinery:bottle_mojang_noir': 16,
    'vinery:jellie_wine': 32
};

// ==========================================
// [설정] 2. 한글 이름 매핑
// ==========================================
const KOREAN_NAMES = {
    'vinery:cristel_wine': '크리스텔 와인',
    'vinery:kelp_cider': '켈프 사이다',
    'vinery:solaris_wine': '솔라리스 와인',
    'vinery:mead': '미드',
    'vinery:apple_cider': '사이다',
    'vinery:apple_wine': '사과 와인',
    'vinery:clark_wine': '클락 와인',
    'vinery:stal_wine': '스탈 와인',
    'vinery:glowing_wine': '발광 와인',
    'vinery:creepers_crush': '크리퍼 짓밞음의 병',
    'vinery:villagers_fright': '마을 주민들의 공포의 병',
    'vinery:magnetic_wine': '자석 와인',
    'vinery:jellie_wine': '젤리 와인',
    'vinery:strad_wine': '스트라드 와인',
    'vinery:chenet_wine': '체네 와인',
    'vinery:aegis_wine': '이지스 와인',
    'vinery:bolvar_wine': '볼바르 와인',
    'vinery:lilitu_wine': '미스릴리투스 와인',
    'vinery:eiswein': '아이스와인',
    'vinery:jo_special_mixture': '조의 특별 혼합물',
    'vinery:noir_wine': '느와르 와인',
    'vinery:bottle_mojang_noir': '모장 느와르의 병'
};

const SELL_BLOCK = 'minecraft:crying_obsidian';

// ==========================================
// [함수] 시세 갱신 로직 (수동 실행용)
// ==========================================
function generateMultiplier() {
    let roll = Math.random() * 100; 
    if (roll < 60) return (Math.random() * 0.3) + 0.9; 
    if (roll < 85) return Math.random() > 0.5 ? (Math.random() * 0.3) + 1.2 : (Math.random() * 0.2) + 0.7;
    if (roll < 97) return Math.random() > 0.5 ? (Math.random() * 1.5) + 1.5 : (Math.random() * 0.3) + 0.4;
    return (Math.random() * 2.0) + 3.0;
}

function updateMarket(server) {
    let newMultipliers = {};
    Object.keys(WINE_MARKET_DB).forEach(wineId => {
        newMultipliers[wineId] = parseFloat(generateMultiplier().toFixed(2));
    });

    server.persistentData.marketMultipliers = newMultipliers;
    // 전체 공지
    server.tell(Text.of('📢 [와인 거래소] 와인 시세가 갱신되었습니다!').gold());
}

// ==========================================
// 1. 판매 로직
// ==========================================
BlockEvents.rightClicked(SELL_BLOCK, event => {
    const { item, player, server } = event;
    const wineId = item.id;

    if (WINE_MARKET_DB[wineId]) {
        let multipliers = server.persistentData.marketMultipliers;
        
        // 데이터가 아예 없으면 최초 1회 생성
        if (!multipliers) {
            updateMarket(server);
            multipliers = server.persistentData.marketMultipliers;
        }

        let multiplier = multipliers[wineId] || 1.0;
        let basePrice = WINE_MARKET_DB[wineId];
        let finalPriceCopper = Math.floor(basePrice * multiplier);

        item.count--; 
        
        let gold = Math.floor(finalPriceCopper / 16);
        let remainder = finalPriceCopper % 16;
        let silver = Math.floor(remainder / 4);
        let copper = remainder % 4;

        if (gold > 0) player.give(Item.of('clutter:golden_coin', gold));
        if (silver > 0) player.give(Item.of('clutter:silver_coin', silver));
        if (copper > 0) player.give(Item.of('clutter:copper_coin', copper));
        
        let displayName = KOREAN_NAMES[wineId];
        if (!displayName) displayName = item.getDisplayName().getString();

        let percentage = Math.round(multiplier * 100);
        let color = percentage >= 100 ? '§a' : '§c';

        player.actionBar.visible = true;
        player.tell(Text.of(`💰 판매 완료: ${displayName}`).green()
            .append(Text.of(` (+${finalPriceCopper}c)`).gold())
            .append(Text.of(` [시세: ${color}${percentage}%§r]`).gray()));
        
        event.cancel();
    }
});

// ==========================================
// 2. 명령어 등록
// ==========================================
ServerEvents.commandRegistry(event => {
    const { commands } = event;

    // /marketw : 시세 확인
    event.register(
        commands.literal('marketw')
        .executes(context => {
            const src = context.source;
            const server = src.server;
            
            let multipliers = server.persistentData.marketMultipliers;
            
            // 데이터 없을 시 최초 생성
            if (!multipliers) {
                updateMarket(server);
                multipliers = server.persistentData.marketMultipliers;
            }

            src.sendSuccess(Text.of('============== 🍷 [ 현재 와인 시세 ] 🍷 ==============').gold(), false);

            Object.keys(WINE_MARKET_DB).forEach(wineId => {
                let basePrice = WINE_MARKET_DB[wineId];
                let multiplier = multipliers[wineId] || 1.0;
                let currentPrice = Math.floor(basePrice * multiplier);
                let percentage = Math.round(multiplier * 100);
                
                let itemName = KOREAN_NAMES[wineId];
                if (!itemName) {
                    let itemStack = Item.of(wineId);
                    itemName = (!itemStack.isEmpty() && itemStack.getDisplayName) ? itemStack.getDisplayName().getString() : wineId.split(':')[1];
                }

                let color = 'white';
                let arrow = '-';
                if (percentage >= 300) { color = 'gold'; arrow = '🔥'; }
                else if (percentage >= 150) { color = 'light_purple'; arrow = '▲▲'; }
                else if (percentage > 100) { color = 'green'; arrow = '▲'; }
                else if (percentage < 50) { color = 'dark_red'; arrow = '▼▼'; }
                else if (percentage < 100) { color = 'red'; arrow = '▼'; }

                let msg = Text.of(` ${arrow} `).color(color)
                    .append(Text.of(`${itemName}`).white())
                    .append(Text.of(` : `).gray())
                    .append(Text.of(`${percentage}%`).color(color))
                    .append(Text.of(` (${currentPrice}c)`).darkGray());

                src.sendSuccess(msg, false);
            });
            
            src.sendSuccess(Text.of('===========================================').gold(), false);
            return 1;
        })
    );

    // /marketw_reroll : 강제 갱신 (관리자 전용)
    event.register(
        commands.literal('marketw_reroll')
        .requires(s => s.hasPermission(2))
        .executes(context => {
            const server = context.source.server;
            updateMarket(server);
            context.source.sendSuccess(Text.of('🎲 와인 시세를 새로고침했습니다!').green(), true);
            return 1;
        })
    );
});
