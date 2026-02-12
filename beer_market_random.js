// ==========================================
// [설정] 1. 맥주 & 위스키 기본 가격 (단위: Copper)
// ==========================================
const BREWERY_MARKET_DB = {
    'brewery:beer_wheat': 10,
    'brewery:beer_barley': 10,
    'brewery:beer_hops': 10,
    'brewery:beer_oat': 10,
    'brewery:beer_nettle': 10,
    'brewery:beer_haley': 16,
    'brewery:whiskey_jojannik': 10,
    'brewery:whiskey_lilitusingemalt': 10,
    'brewery:whiskey_cristelwalker': 10,
    'brewery:whiskey_maggoallan': 10,
    'brewery:whiskey_carrasconlabel': 10,
    'brewery:whiskey_ak': 10,
    'brewery:whiskey_highland_hearth': 10,
    'brewery:whiskey_smokey_reverie': 10,
    'brewery:whiskey_jamesons_malt': 10,
    'brewery:dark_brew': 36
};

// ==========================================
// [설정] 2. 한글 이름 매핑
// ==========================================
const BREWERY_KOREAN_NAMES = {
    'brewery:beer_wheat': '밀 맥주',
    'brewery:beer_barley': '보리 맥주',
    'brewery:beer_hops': '홉 맥주',
    'brewery:beer_nettle': '쐐기풀 맥주',
    'brewery:beer_oat': '귀리 맥주',
    'brewery:beer_haley': '헤일리 맥주',
    
    'brewery:whiskey_jojannik': '조자닉 셀렉트',
    'brewery:whiskey_lilitusingemalt': '릴리투 싱글 몰트',
    'brewery:whiskey_cristelwalker': '크리스텔 워커 오리지널',
    'brewery:whiskey_maggoallan': '숙성된 마고앨런',
    'brewery:whiskey_carrasconlabel': '카라스콘 라벨의 유산',
    'brewery:whiskey_ak': 'AK 위스키',
    'brewery:whiskey_highland_hearth': '하이랜드 하스 시그니처',
    'brewery:whiskey_smokey_reverie': '숙성된 스모키 레버리',
    'brewery:whiskey_jamesons_malt': '제임슨 몰트 위스키',
    'brewery:dark_brew': '다크 브루'
};

// 판매 트리거 블록 (가마솥)
const BREW_SELL_BLOCK = 'minecraft:crying_obsidian';

// ==========================================
// [함수] 시세 갱신 로직 (와인과 별개로 작동)
// ==========================================
function generateBreweryMultiplier() {
    let roll = Math.random() * 100; 
    // 확률 분포: 60% 평범, 25% 소폭변동, 12% 대박/폭락, 3% 초대박
    if (roll < 60) return (Math.random() * 0.3) + 0.9; 
    if (roll < 85) return Math.random() > 0.5 ? (Math.random() * 0.3) + 1.2 : (Math.random() * 0.2) + 0.7;
    if (roll < 97) return Math.random() > 0.5 ? (Math.random() * 1.5) + 1.5 : (Math.random() * 0.3) + 0.4;
    return (Math.random() * 2.0) + 3.0;
}

function updateBreweryMarket(server) {
    let newMultipliers = {};
    Object.keys(BREWERY_MARKET_DB).forEach(itemId => {
        newMultipliers[itemId] = parseFloat(generateBreweryMultiplier().toFixed(2));
    });

    // 저장 키(Key)를 다르게 설정하여 와인 데이터와 섞이지 않게 함
    server.persistentData.breweryMarketMultipliers = newMultipliers;
    
    // 전체 공지
    server.tell(Text.of('🍺 [양조장 거래소] 맥주와 위스키 시세가 갱신되었습니다!').gold());
}

// ==========================================
// 1. 판매 로직
// ==========================================
BlockEvents.rightClicked(BREW_SELL_BLOCK, event => {
    const { item, player, server } = event;
    const itemId = item.id;

    if (BREWERY_MARKET_DB[itemId]) {
        let multipliers = server.persistentData.breweryMarketMultipliers;
        
        // 데이터가 아예 없으면 최초 1회 생성
        if (!multipliers) {
            updateBreweryMarket(server);
            multipliers = server.persistentData.breweryMarketMultipliers;
        }

        let multiplier = multipliers[itemId] || 1.0;
        let basePrice = BREWERY_MARKET_DB[itemId];
        let finalPriceCopper = Math.floor(basePrice * multiplier);

        item.count--; 
        
        // 환전 로직
        let gold = Math.floor(finalPriceCopper / 16);
        let remainder = finalPriceCopper % 16;
        let silver = Math.floor(remainder / 4);
        let copper = remainder % 4;

        if (gold > 0) player.give(Item.of('clutter:golden_coin', gold));
        if (silver > 0) player.give(Item.of('clutter:silver_coin', silver));
        if (copper > 0) player.give(Item.of('clutter:copper_coin', copper));
        
        let displayName = BREWERY_KOREAN_NAMES[itemId];
        if (!displayName) displayName = item.getDisplayName().getString();

        let percentage = Math.round(multiplier * 100);
        let color = percentage >= 100 ? '§a' : '§c';

        player.actionBar.visible = true;
        player.tell(Text.of(`🍺 판매 완료: ${displayName}`).green()
            .append(Text.of(` (+${finalPriceCopper}c)`).gold())
            .append(Text.of(` [시세: ${color}${percentage}%§r]`).gray()));
        
        event.cancel();
    }
});

// ==========================================
// 2. 명령어 등록 (/marketb, /marketb_reroll)
// ==========================================
ServerEvents.commandRegistry(event => {
    const { commands } = event;

    // /marketb : 양조장 시세 확인 (b for brewery)
    event.register(
        commands.literal('marketb')
        .executes(context => {
            const src = context.source;
            const server = src.server;
            
            let multipliers = server.persistentData.breweryMarketMultipliers;
            
            if (!multipliers) {
                updateBreweryMarket(server);
                multipliers = server.persistentData.breweryMarketMultipliers;
            }

            src.sendSuccess(Text.of('============== 🍺 [ 양조장 주류 시세 ] 🍺 ==============').gold(), false);

            Object.keys(BREWERY_MARKET_DB).forEach(itemId => {
                let basePrice = BREWERY_MARKET_DB[itemId];
                let multiplier = multipliers[itemId] || 1.0;
                let currentPrice = Math.floor(basePrice * multiplier);
                let percentage = Math.round(multiplier * 100);
                
                let itemName = BREWERY_KOREAN_NAMES[itemId];
                if (!itemName) {
                    let itemStack = Item.of(itemId);
                    itemName = (!itemStack.isEmpty() && itemStack.getDisplayName) ? itemStack.getDisplayName().getString() : itemId.split(':')[1];
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
            
            src.sendSuccess(Text.of('============================================').gold(), false);
            return 1;
        })
    );

    // /marketb_reroll : 양조장 강제 갱신
    event.register(
        commands.literal('marketb_reroll')
        .requires(s => s.hasPermission(2))
        .executes(context => {
            const server = context.source.server;
            updateBreweryMarket(server);
            context.source.sendSuccess(Text.of('🎲 양조장 시세를 새로고침했습니다!').green(), true);
            return 1;
        })
    );
});
