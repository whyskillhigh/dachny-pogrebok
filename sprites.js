/**
 * Дачный Погребок: Закатки на зиму
 * Векторные спрайты плодов и банок для Canvas (v6.0)
 * Все силуэты плотно заполняют физический радиус (98–100%) без пустых зазоров,
 * а мировая тень рисуется отдельно в game.js до поворота тела.
 */

const FRUIT_DEFS = [
    {
        id: 0,
        name: 'Клубничка',
        radius: 20,
        score: 2,
        color: '#e52d27'
    },
    {
        id: 1,
        name: 'Огурчик',
        radius: 28,
        score: 4,
        color: '#43a047'
    },
    {
        id: 2,
        name: 'Помидорка',
        radius: 38,
        score: 8,
        color: '#f44336'
    },
    {
        id: 3,
        name: 'Яблочко',
        radius: 48,
        score: 16,
        color: '#ff9800'
    },
    {
        id: 4,
        name: 'Кабачок',
        radius: 60,
        score: 32,
        color: '#8bc34a'
    },
    {
        id: 5,
        name: 'Тыква',
        radius: 74,
        score: 64,
        color: '#ff6f00'
    },
    {
        id: 6,
        name: 'Банка с огурцами',
        radius: 90,
        score: 128,
        color: '#2e7d32'
    },
    {
        id: 7,
        name: 'Золотая банка варенья',
        radius: 106,
        score: 256,
        color: '#ffd700'
    }
];

class SpriteRenderer {
    constructor() {
        this.cache = new Map();
        this.dpr = Math.min(window.devicePixelRatio || 2, 2.5);
    }

    init() {
        FRUIT_DEFS.forEach(def => {
            const canvas = document.createElement('canvas');
            const size = Math.ceil(def.radius * 2.4 * this.dpr);
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.scale(this.dpr, this.dpr);

            const cx = (size / this.dpr) / 2;
            const cy = (size / this.dpr) / 2;

            this.drawFruit(ctx, def.id, cx, cy, def.radius);
            this.cache.set(def.id, canvas);
        });
    }

    getSprite(tier) {
        return this.cache.get(tier);
    }

    drawFruit(ctx, tier, cx, cy, r) {
        ctx.save();
        ctx.translate(cx, cy);

        switch (tier) {
            case 0:
                this.drawStrawberry(ctx, r);
                break;
            case 1:
                this.drawCucumber(ctx, r);
                break;
            case 2:
                this.drawTomato(ctx, r);
                break;
            case 3:
                this.drawApple(ctx, r);
                break;
            case 4:
                this.drawZucchini(ctx, r);
                break;
            case 5:
                this.drawPumpkin(ctx, r);
                break;
            case 6:
                this.drawPickleJar(ctx, r);
                break;
            case 7:
                this.drawGoldenJar(ctx, r);
                break;
        }

        ctx.restore();
    }

    // 0. КЛУБНИЧКА (пухлая ягода, 98% хитбокса)
    drawStrawberry(ctx, r) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, r * 0.99);
        ctx.bezierCurveTo(r * 0.85, r * 0.95, r * 1.08, -r * 0.15, r * 0.78, -r * 0.74);
        ctx.bezierCurveTo(r * 0.45, -r * 0.99, 0, -r * 0.88, 0, -r * 0.88);
        ctx.bezierCurveTo(0, -r * 0.88, -r * 0.45, -r * 0.99, -r * 0.78, -r * 0.74);
        ctx.bezierCurveTo(-r * 1.08, -r * 0.15, -r * 0.85, r * 0.95, 0, r * 0.99);
        ctx.closePath();

        const grad = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.1, 0, 0, r * 1.05);
        grad.addColorStop(0, '#ff5263');
        grad.addColorStop(0.45, '#e81123');
        grad.addColorStop(1, '#8c0010');
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = '#5c0a14';
        ctx.lineWidth = Math.max(1.6, r * 0.06);
        ctx.stroke();

        // Семена клубники
        ctx.fillStyle = '#ffeaa7';
        const seeds = [
            [-0.36, -0.42], [0.36, -0.42], [0, -0.25],
            [-0.55, -0.08], [0.55, -0.08], [-0.28, 0.16],
            [0.28, 0.16], [0, 0.36], [-0.24, 0.56],
            [0.24, 0.56], [0, 0.75]
        ];
        seeds.forEach(([sx, sy]) => {
            ctx.beginPath();
            ctx.ellipse(sx * r, sy * r, r * 0.075, r * 0.045, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Глянцевый блик
        ctx.beginPath();
        ctx.ellipse(-r * 0.44, -r * 0.34, r * 0.26, r * 0.13, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
        ctx.fill();

        // Зелёный чашелистик аккуратно сверху ягоды
        ctx.save();
        ctx.translate(0, -r * 0.72);
        this.drawCalyx(ctx, r * 0.86, 5, '#2ed573', '#10ac84');
        ctx.restore();

        ctx.restore();
    }

    // 1. ОГУРЧИК (r * 0.99 + чёткий контур)
    drawCucumber(ctx, r) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.99, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.14, 0, 0, r * 1.02);
        grad.addColorStop(0, '#72d455');
        grad.addColorStop(0.45, '#388e3c');
        grad.addColorStop(1, '#1b5e20');
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = '#144718';
        ctx.lineWidth = Math.max(1.8, r * 0.05);
        ctx.stroke();

        // Пупырышки (бугорки с шипиками)
        const bumps = [
            [-0.5, -0.4], [-0.1, -0.62], [0.42, -0.38],
            [-0.62, 0.1], [-0.2, 0.0], [0.3, 0.15], [0.62, -0.05],
            [-0.35, 0.48], [0.15, 0.52], [-0.1, 0.76], [0.48, 0.45]
        ];
        bumps.forEach(([bx, by]) => {
            ctx.beginPath();
            ctx.arc(bx * r, by * r, r * 0.09, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(174, 234, 0, 0.75)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(bx * r, by * r, r * 0.032, 0, Math.PI * 2);
            ctx.fillStyle = '#1b5e20';
            ctx.fill();
        });

        // Блик
        ctx.beginPath();
        ctx.ellipse(-r * 0.4, -r * 0.4, r * 0.28, r * 0.15, -Math.PI / 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
        ctx.fill();

        // Хвостик в пределах 1.06*r
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.94);
        ctx.quadraticCurveTo(-r * 0.12, -r * 1.04, 0, -r * 1.07);
        ctx.lineWidth = r * 0.12;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#2e7d32';
        ctx.stroke();

        // Жёлтый цветочек на кончике
        ctx.fillStyle = '#ffeb3b';
        const flowerY = r * 0.90;
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * r * 0.11, flowerY + Math.sin(angle) * r * 0.075, r * 0.068, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(0, flowerY, r * 0.055, 0, Math.PI * 2);
        ctx.fillStyle = '#ff9800';
        ctx.fill();

        ctx.restore();
    }

    // 2. ПОМИДОРКА (r * 0.99 + объёмные дольки и контур)
    drawTomato(ctx, r) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, r * 0.01, r * 0.99, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(-r * 0.34, -r * 0.34, r * 0.1, 0, 0, r * 1.02);
        grad.addColorStop(0, '#ff6b6b');
        grad.addColorStop(0.32, '#ee1c25');
        grad.addColorStop(0.76, '#c0151f');
        grad.addColorStop(1, '#7a0910');
        ctx.fillStyle = grad;
        ctx.fill();

        // Лёгкие мягкие дольки томата
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, r * 0.01, r * 0.97, 0, Math.PI * 2);
        ctx.clip();
        ctx.strokeStyle = 'rgba(110, 5, 10, 0.18)';
        ctx.lineWidth = Math.max(1.5, r * 0.03);
        [-0.36, 0.36].forEach((offsetX) => {
            ctx.beginPath();
            ctx.ellipse(offsetX * r, r * 0.05, r * 0.32, r * 0.96, 0, 0, Math.PI * 2);
            ctx.stroke();
        });
        ctx.restore();

        ctx.beginPath();
        ctx.arc(0, r * 0.01, r * 0.99, 0, Math.PI * 2);
        ctx.strokeStyle = '#63080e';
        ctx.lineWidth = Math.max(1.8, r * 0.045);
        ctx.stroke();

        // Глянцевый сочный блик
        ctx.beginPath();
        ctx.ellipse(-r * 0.38, -r * 0.36, r * 0.32, r * 0.16, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.fill();

        // Вторичный блик снизу
        ctx.beginPath();
        ctx.arc(r * 0.3, r * 0.32, r * 0.16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 120, 120, 0.22)';
        ctx.fill();

        // Зелёная плодоножка (строго внутри ±1.15*r)
        ctx.translate(0, -r * 0.80);
        this.drawCalyx(ctx, r * 0.86, 6, '#4caf50', '#2e7d32');
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(r * 0.12, -r * 0.14, r * 0.05, -r * 0.20);
        ctx.lineWidth = r * 0.11;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#2e7d32';
        ctx.stroke();

        ctx.restore();
    }

    // 3. НАЛИВНОЕ ЯБЛОЧКО (полный контур 99% по ширине и высоте)
    drawApple(ctx, r) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.84);
        ctx.bezierCurveTo(r * 0.46, -r * 1.04, r * 1.06, -r * 0.56, r * 1.01, r * 0.16);
        ctx.bezierCurveTo(r * 0.98, r * 0.82, r * 0.45, r * 1.02, 0, r * 0.97);
        ctx.bezierCurveTo(-r * 0.45, r * 1.02, -r * 0.98, r * 0.82, -r * 1.01, r * 0.16);
        ctx.bezierCurveTo(-r * 1.06, -r * 0.56, -r * 0.46, -r * 1.04, 0, -r * 0.84);
        ctx.closePath();

        const grad = ctx.createRadialGradient(-r * 0.25, -r * 0.22, r * 0.1, 0, 0, r * 1.06);
        grad.addColorStop(0, '#fff176');
        grad.addColorStop(0.35, '#ffb300');
        grad.addColorStop(0.66, '#e53935');
        grad.addColorStop(1, '#8e0000');
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = '#5e110b';
        ctx.lineWidth = Math.max(2, r * 0.042);
        ctx.stroke();

        // Блик
        ctx.beginPath();
        ctx.ellipse(-r * 0.42, -r * 0.34, r * 0.3, r * 0.14, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
        ctx.fill();

        // Ямочка сверху
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.82, r * 0.18, r * 0.075, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(70, 20, 10, 0.42)';
        ctx.fill();

        // Коричневый черешок (в пределах -1.08*r)
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.82);
        ctx.quadraticCurveTo(r * 0.12, -r * 0.98, r * 0.04, -r * 1.08);
        ctx.lineWidth = r * 0.095;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#4e342e';
        ctx.stroke();

        // Зелёный листочек с прожилкой
        ctx.save();
        ctx.translate(r * 0.09, -r * 0.96);
        ctx.rotate(Math.PI / 5);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(r * 0.26, -r * 0.18, r * 0.42, 0);
        ctx.quadraticCurveTo(r * 0.26, r * 0.18, 0, 0);
        ctx.fillStyle = '#43a047';
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(r * 0.38, 0);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#2e7d32';
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    }

    // 4. ДАЧНЫЙ КАБАЧОК (r * 0.99 + контур)
    drawZucchini(ctx, r) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, r * 0.01, r * 0.99, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(-r * 0.28, -r * 0.28, r * 0.1, 0, 0, r * 1.02);
        grad.addColorStop(0, '#dce775');
        grad.addColorStop(0.35, '#9ccc65');
        grad.addColorStop(0.72, '#689f38');
        grad.addColorStop(1, '#33691e');
        ctx.fillStyle = grad;
        ctx.fill();

        // Полосочки
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, r * 0.01, r * 0.98, 0, Math.PI * 2);
        ctx.clip();
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.ellipse(i * r * 0.25, 0, r * 0.08, r * 0.96, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(230, 255, 180, 0.24)';
            ctx.fill();
        }
        ctx.restore();

        ctx.beginPath();
        ctx.arc(0, r * 0.01, r * 0.99, 0, Math.PI * 2);
        ctx.strokeStyle = '#234d14';
        ctx.lineWidth = Math.max(2, r * 0.04);
        ctx.stroke();

        // Крапинки
        for (let j = 0; j < 14; j++) {
            const angle = j * 0.5;
            const dist = (0.2 + (j % 4) * 0.2) * r;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, r * 0.025, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(240, 255, 200, 0.42)';
            ctx.fill();
        }

        // Блик
        ctx.beginPath();
        ctx.ellipse(-r * 0.4, -r * 0.38, r * 0.32, r * 0.16, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.52)';
        ctx.fill();

        // Компактный хвостик вверху
        ctx.beginPath();
        ctx.moveTo(-r * 0.09, -r * 0.94);
        ctx.lineTo(-r * 0.11, -r * 1.08);
        ctx.lineTo(r * 0.11, -r * 1.08);
        ctx.lineTo(r * 0.09, -r * 0.94);
        ctx.closePath();
        ctx.fillStyle = '#558b2f';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, -r * 1.08, r * 0.11, r * 0.04, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#7cb342';
        ctx.fill();

        ctx.restore();
    }

    // 5. СПЕЛАЯ ТЫКВА (фикс ширины: полные ±0.99*r без бокового зазора)
    drawPumpkin(ctx, r) {
        ctx.save();

        // Полный пухлый контур тыквы
        ctx.beginPath();
        ctx.ellipse(0, r * 0.02, r * 0.99, r * 0.97, 0, 0, Math.PI * 2);
        const baseGrad = ctx.createRadialGradient(-r * 0.28, -r * 0.28, r * 0.12, 0, r * 0.02, r * 1.05);
        baseGrad.addColorStop(0, '#ffb74d');
        baseGrad.addColorStop(0.45, '#fb8c00');
        baseGrad.addColorStop(0.82, '#e65100');
        baseGrad.addColorStop(1, '#b83206');
        ctx.fillStyle = baseGrad;
        ctx.fill();

        // Внутри силуэта рисуем объёмные дольки и рёбра по всей ширине ±0.99*r
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, r * 0.02, r * 0.99, r * 0.97, 0, 0, Math.PI * 2);
        ctx.clip();

        const ribs = [-0.72, -0.44, -0.16, 0.16, 0.44, 0.72];
        ribs.forEach((rx) => {
            ctx.beginPath();
            ctx.ellipse(rx * r * 0.85, r * 0.02, Math.abs(rx) < 0.2 ? r * 0.26 : r * 0.34, r * 0.98, 0, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(122, 34, 5, 0.34)';
            ctx.lineWidth = Math.max(2, r * 0.032);
            ctx.stroke();

            // Мягкий объёмный подсвет каждого сегмента
            ctx.beginPath();
            ctx.ellipse(rx * r * 0.85 - r * 0.06, -r * 0.06, r * 0.14, r * 0.72, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 224, 150, 0.11)';
            ctx.fill();
        });
        ctx.restore();

        // Чёткий тёплый внешний контур
        ctx.beginPath();
        ctx.ellipse(0, r * 0.02, r * 0.99, r * 0.97, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#7a2205';
        ctx.lineWidth = Math.max(2.2, r * 0.038);
        ctx.stroke();

        // Глянцевый блик
        ctx.beginPath();
        ctx.ellipse(-r * 0.32, -r * 0.34, r * 0.34, r * 0.17, -Math.PI / 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
        ctx.fill();

        // Деревянный стебель и усик сверху (аккуратно до -1.09*r)
        ctx.beginPath();
        ctx.moveTo(-r * 0.09, -r * 0.90);
        ctx.bezierCurveTo(-r * 0.11, -r * 1.07, r * 0.16, -r * 1.08, r * 0.12, -r * 1.12);
        ctx.bezierCurveTo(r * 0.05, -r * 1.14, -r * 0.03, -r * 1.05, 0.04 * r, -r * 0.90);
        ctx.fillStyle = '#4e342e';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(r * 0.22, -r * 0.96, r * 0.12, 0, Math.PI * 1.45);
        ctx.lineWidth = Math.max(2, r * 0.035);
        ctx.strokeStyle = '#689f38';
        ctx.stroke();

        ctx.restore();
    }

    // 6. ПУЗАТАЯ БАНКА С ОГУРЦАМИ (круглое пузо ±0.97*r + крышка до -0.99*r, БЕЗ воздушного купола!)
    drawPickleJar(ctx, r) {
        ctx.save();
        const cyJar = r * 0.03;
        const rJar = r * 0.965;

        // 1. Внешнее стекло + рассол в форме пузатого бочонка
        ctx.beginPath();
        ctx.arc(0, cyJar, rJar, 0, Math.PI * 2);
        const brineGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.2, r * 0.15, 0, cyJar, rJar);
        brineGrad.addColorStop(0, '#dcedc8');
        brineGrad.addColorStop(0.55, '#aed581');
        brineGrad.addColorStop(1, '#558b2f');
        ctx.fillStyle = brineGrad;
        ctx.fill();

        // 2. Внутренние огурчики и специи строго внутри круглого стекла
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, cyJar, rJar * 0.96, 0, Math.PI * 2);
        ctx.clip();

        const jarPickles = [
            { x: -r * 0.44, y: r * 0.18, rot: -0.38, len: r * 0.62 },
            { x: r * 0.42, y: r * 0.16, rot: 0.34, len: r * 0.60 },
            { x: -r * 0.04, y: r * 0.38, rot: 0.08, len: r * 0.64 },
            { x: -r * 0.28, y: -r * 0.22, rot: 0.22, len: r * 0.52 },
            { x: r * 0.26, y: -r * 0.18, rot: -0.25, len: r * 0.54 }
        ];

        jarPickles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.beginPath();
            ctx.roundRect(-r * 0.15, -p.len / 2, r * 0.3, p.len, r * 0.14);
            ctx.fillStyle = '#388e3c';
            ctx.fill();
            ctx.strokeStyle = '#1b5e20';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#7cb342';
            ctx.beginPath();
            ctx.arc(-r * 0.04, -p.len * 0.22, r * 0.038, 0, Math.PI * 2);
            ctx.arc(r * 0.04, p.len * 0.12, r * 0.038, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Горошины перца и укропный зонтик
        ctx.fillStyle = '#263238';
        [[-r * 0.48, r * 0.62], [r * 0.46, r * 0.58], [0, r * 0.78], [r * 0.12, -r * 0.34]].forEach(([px, py]) => {
            ctx.beginPath();
            ctx.arc(px, py, r * 0.042, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.strokeStyle = '#9e9d24';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(r * 0.08, -r * 0.36);
        for (let a = -0.8; a <= 0.8; a += 0.4) {
            ctx.lineTo(r * 0.08 + Math.sin(a) * r * 0.26, -r * 0.36 - Math.cos(a) * r * 0.2);
            ctx.moveTo(r * 0.08, -r * 0.36);
        }
        ctx.stroke();
        ctx.restore();

        // 3. Изогнутый стеклянный блик на пузатом боку
        ctx.beginPath();
        ctx.arc(0, cyJar, rJar * 0.87, Math.PI * 0.74, Math.PI * 1.24);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
        ctx.lineWidth = r * 0.085;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, cyJar, rJar * 0.76, Math.PI * 0.82, Math.PI * 1.18);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.36)';
        ctx.lineWidth = r * 0.032;
        ctx.stroke();

        // 4. Контур стекла
        ctx.beginPath();
        ctx.arc(0, cyJar, rJar, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
        ctx.lineWidth = 3.2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, cyJar, rJar + 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(46, 85, 48, 0.55)';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // 5. Винтажная этикетка "ОГУРЧИКИ"
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(-r * 0.54, -r * 0.06, r * 1.08, r * 0.36, 5);
        ctx.fillStyle = '#fff9c4';
        ctx.fill();
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.fillStyle = '#3e2723';
        ctx.font = `bold ${Math.round(r * 0.15)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ОГУРЧИКИ', 0, r * 0.12);
        ctx.restore();

        // 6. Крышка с салфеткой прямо поверх макушки банки (до -0.99*r)
        this.drawJarLid(ctx, r, '#e53935', false);

        ctx.restore();
    }

    // 7. ЗОЛОТАЯ БАНКА ВАРЕНЬЯ (пузатая круглая форма ±0.97*r)
    drawGoldenJar(ctx, r) {
        ctx.save();
        const cyJar = r * 0.03;
        const rJar = r * 0.965;

        // Внешнее мягкое золотое свечение в пределах холста
        ctx.save();
        const glowGrad = ctx.createRadialGradient(0, cyJar, r * 0.72, 0, cyJar, r * 1.12);
        glowGrad.addColorStop(0, 'rgba(255, 215, 0, 0.45)');
        glowGrad.addColorStop(0.7, 'rgba(255, 179, 0, 0.2)');
        glowGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, cyJar, r * 1.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Стеклянный корпус с малиновым вареньем
        ctx.beginPath();
        ctx.arc(0, cyJar, rJar, 0, Math.PI * 2);
        const jamGrad = ctx.createRadialGradient(-r * 0.24, -r * 0.2, r * 0.12, 0, cyJar, rJar);
        jamGrad.addColorStop(0, '#ff4081');
        jamGrad.addColorStop(0.45, '#c2185b');
        jamGrad.addColorStop(0.85, '#880e4f');
        jamGrad.addColorStop(1, '#4a0072');
        ctx.fillStyle = jamGrad;
        ctx.fill();

        // Ягодки малины внутри варенья
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, cyJar, rJar * 0.96, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#ff80ab';
        [[-r * 0.4, -r * 0.1], [r * 0.36, 0], [0, r * 0.38], [-r * 0.28, r * 0.56], [r * 0.32, r * 0.58], [0, -r * 0.34]].forEach(([bx, by]) => {
            ctx.beginPath();
            ctx.arc(bx, by, r * 0.1, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        // Изогнутый блик
        ctx.beginPath();
        ctx.arc(0, cyJar, rJar * 0.87, Math.PI * 0.74, Math.PI * 1.24);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.86)';
        ctx.lineWidth = r * 0.085;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Золотая окантовка
        ctx.beginPath();
        ctx.arc(0, cyJar, rJar, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3.6;
        ctx.stroke();

        // Золотая табличка
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(-r * 0.62, -r * 0.08, r * 1.24, r * 0.38, 6);
        const goldGrad = ctx.createLinearGradient(-r * 0.62, 0, r * 0.62, 0);
        goldGrad.addColorStop(0, '#ffd700');
        goldGrad.addColorStop(0.5, '#fff9c4');
        goldGrad.addColorStop(1, '#ffb300');
        ctx.fillStyle = goldGrad;
        ctx.fill();
        ctx.strokeStyle = '#bf360c';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#bf360c';
        ctx.font = `900 ${Math.round(r * 0.15)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★ ДЖЕКПОТ ★', 0, r * 0.11);
        ctx.restore();

        // Золотая крышка-салфетка вровень с верхом хитбокса
        this.drawJarLid(ctx, r, '#ffd700', true);

        // Искры внутри безопасной границы
        this.drawSparkle(ctx, -r * 0.74, -r * 0.56, r * 0.19);
        this.drawSparkle(ctx, r * 0.76, -r * 0.45, r * 0.21);
        this.drawSparkle(ctx, r * 0.68, r * 0.56, r * 0.17);
        this.drawSparkle(ctx, -r * 0.68, r * 0.62, r * 0.15);

        ctx.restore();
    }

    // Крышка круглой банки-бочонка (сидит чётко от -0.99*r до -0.60*r)
    drawJarLid(ctx, r, capColor, isGold = false) {
        ctx.save();
        const capW = r * 0.72;
        const capTop = -r * 0.97;
        const capSkirt = -r * 0.60;

        ctx.beginPath();
        ctx.moveTo(-capW * 0.82, -r * 0.85);
        ctx.quadraticCurveTo(0, capTop - r * 0.04, capW * 0.82, -r * 0.85);
        ctx.lineTo(capW * 1.02, capSkirt);

        // Волнистая юбочка салфетки
        const frills = 8;
        const step = (capW * 2.04) / frills;
        for (let i = 0; i < frills; i++) {
            const startX = capW * 1.02 - i * step;
            const endX = startX - step;
            ctx.quadraticCurveTo(startX - step / 2, capSkirt + r * 0.09, endX, capSkirt);
        }
        ctx.closePath();

        ctx.fillStyle = capColor;
        ctx.fill();

        if (!isGold) {
            ctx.save();
            ctx.clip();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.48)';
            ctx.lineWidth = 2.4;
            for (let x = -capW * 1.1; x <= capW * 1.1; x += r * 0.13) {
                ctx.beginPath();
                ctx.moveTo(x, -r * 1.04);
                ctx.lineTo(x, capSkirt + r * 0.12);
                ctx.stroke();
            }
            for (let y = -r * 1.04; y <= capSkirt + r * 0.12; y += r * 0.13) {
                ctx.beginPath();
                ctx.moveTo(-capW * 1.1, y);
                ctx.lineTo(capW * 1.1, y);
                ctx.stroke();
            }
            ctx.restore();
        }

        // Контур крышки
        ctx.strokeStyle = isGold ? '#bf360c' : '#8e1c1c';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Бечёвка с бантиком
        const ropeY = capSkirt - r * 0.08;
        ctx.beginPath();
        ctx.ellipse(0, ropeY, capW * 0.9, r * 0.045, 0, 0, Math.PI * 2);
        ctx.strokeStyle = isGold ? '#d84315' : '#6d4c41';
        ctx.lineWidth = r * 0.05;
        ctx.stroke();

        ctx.fillStyle = isGold ? '#d84315' : '#8d6e63';
        ctx.beginPath();
        ctx.arc(-r * 0.09, ropeY, r * 0.055, 0, Math.PI * 2);
        ctx.arc(r * 0.09, ropeY, r * 0.055, 0, Math.PI * 2);
        ctx.arc(0, ropeY, r * 0.042, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawCalyx(ctx, r, numPoints, col1, col2) {
        ctx.save();
        for (let i = 0; i < numPoints; i++) {
            const angle = (i * Math.PI * 2) / numPoints;
            ctx.save();
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-r * 0.08, -r * 0.24, 0, -r * 0.36);
            ctx.quadraticCurveTo(r * 0.08, -r * 0.24, 0, 0);
            ctx.fillStyle = i % 2 === 0 ? col1 : col2;
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }

    drawSparkle(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.quadraticCurveTo(0, 0, size, 0);
        ctx.quadraticCurveTo(0, 0, 0, size);
        ctx.quadraticCurveTo(0, 0, -size, 0);
        ctx.quadraticCurveTo(0, 0, 0, -size);
        ctx.fillStyle = '#fffde7';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
    }
}

window.spriteRenderer = new SpriteRenderer();
