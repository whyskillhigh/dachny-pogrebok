/**
 * Дачный Погребок: Закатки на зиму
 * Векторные спрайты плодов и банок для Canvas
 * Рендерит сочные, детализированные спрайты в высоком разрешении.
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

        // Мягкая внешняя тень под плодом
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, r * 0.88, r * 0.75, r * 0.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(20, 10, 5, 0.22)';
        ctx.filter = 'blur(2px)';
        ctx.fill();
        ctx.restore();

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

    // 0. КЛУБНИЧКА
    drawStrawberry(ctx, r) {
        ctx.save();
        // Сердечковидное сочное тело ягоды
        ctx.beginPath();
        ctx.moveTo(0, r * 0.95);
        ctx.bezierCurveTo(r * 0.9, r * 0.7, r * 1.05, -r * 0.3, r * 0.65, -r * 0.75);
        ctx.bezierCurveTo(r * 0.25, -r * 0.95, 0, -r * 0.75, 0, -r * 0.75);
        ctx.bezierCurveTo(0, -r * 0.75, -r * 0.25, -r * 0.95, -r * 0.65, -r * 0.75);
        ctx.bezierCurveTo(-r * 1.05, -r * 0.3, -r * 0.9, r * 0.7, 0, r * 0.95);
        ctx.closePath();

        const grad = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.1, 0, 0, r * 1.05);
        grad.addColorStop(0, '#ff4757');
        grad.addColorStop(0.4, '#e81123');
        grad.addColorStop(1, '#9b0014');
        ctx.fillStyle = grad;
        ctx.fill();

        // Семена клубники
        ctx.fillStyle = '#ffeaa7';
        const seeds = [
            [-0.3, -0.4], [0.3, -0.4], [0, -0.2],
            [-0.45, -0.1], [0.45, -0.1], [-0.25, 0.15],
            [0.25, 0.15], [0, 0.35], [-0.18, 0.55],
            [0.18, 0.55], [0, 0.72]
        ];
        seeds.forEach(([sx, sy]) => {
            ctx.beginPath();
            ctx.ellipse(sx * r, sy * r, r * 0.07, r * 0.04, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Блик
        ctx.beginPath();
        ctx.ellipse(-r * 0.45, -r * 0.35, r * 0.25, r * 0.12, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.fill();

        // Зеленый чашелистик
        this.drawCalyx(ctx, r, 5, '#2ed573', '#10ac84');

        ctx.restore();
    }

    // 1. ОГУРЧИК
    drawCucumber(ctx, r) {
        ctx.save();
        // Пухлый круглый огурчик
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.94, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.15, 0, 0, r);
        grad.addColorStop(0, '#6bc950');
        grad.addColorStop(0.45, '#388e3c');
        grad.addColorStop(1, '#1b5e20');
        ctx.fillStyle = grad;
        ctx.fill();

        // Пупырышки (бугорки с шипиками)
        const bumps = [
            [-0.5, -0.4], [-0.1, -0.6], [0.4, -0.35],
            [-0.6, 0.1], [-0.2, 0.0], [0.3, 0.15], [0.6, -0.05],
            [-0.35, 0.45], [0.15, 0.5], [-0.1, 0.75], [0.45, 0.45]
        ];
        bumps.forEach(([bx, by]) => {
            ctx.beginPath();
            ctx.arc(bx * r, by * r, r * 0.09, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(174, 234, 0, 0.75)';
            ctx.fill();
            // Точка-шипик
            ctx.beginPath();
            ctx.arc(bx * r, by * r, r * 0.03, 0, Math.PI * 2);
            ctx.fillStyle = '#1b5e20';
            ctx.fill();
        });

        // Блик
        ctx.beginPath();
        ctx.ellipse(-r * 0.4, -r * 0.4, r * 0.28, r * 0.15, -Math.PI / 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();

        // Хвостик и желтый цветочек на огурце
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.92);
        ctx.quadraticCurveTo(-r * 0.15, -r * 1.15, 0, -r * 1.2);
        ctx.lineWidth = r * 0.14;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#2e7d32';
        ctx.stroke();

        // Желтый цветок на кончике (признак свежайшего дачного огурчика!)
        ctx.fillStyle = '#ffeb3b';
        const flowerY = r * 0.92;
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * r * 0.12, flowerY + Math.sin(angle) * r * 0.08, r * 0.07, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(0, flowerY, r * 0.06, 0, Math.PI * 2);
        ctx.fillStyle = '#ff9800';
        ctx.fill();

        ctx.restore();
    }

    // 2. ПОМИДОРКА
    drawTomato(ctx, r) {
        ctx.save();
        // Наливной круглый помидор
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
        grad.addColorStop(0, '#ff6b6b');
        grad.addColorStop(0.3, '#ee1c25');
        grad.addColorStop(0.75, '#c0151f');
        grad.addColorStop(1, '#7a0910');
        ctx.fillStyle = grad;
        ctx.fill();

        // Глянцевый сочный блик
        ctx.beginPath();
        ctx.ellipse(-r * 0.38, -r * 0.38, r * 0.32, r * 0.16, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.fill();

        // Вторичный мягкий блик снизу (светотень)
        ctx.beginPath();
        ctx.arc(r * 0.3, r * 0.3, r * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 120, 120, 0.2)';
        ctx.fill();

        // Зеленая плодоножка в форме звездочки
        ctx.translate(0, -r * 0.88);
        this.drawCalyx(ctx, r * 1.25, 6, '#4caf50', '#2e7d32');
        // Хвостик
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(r * 0.2, -r * 0.25, r * 0.08, -r * 0.35);
        ctx.lineWidth = r * 0.14;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#2e7d32';
        ctx.stroke();

        ctx.restore();
    }

    // 3. НАЛИВНОЕ ЯБЛОЧКО
    drawApple(ctx, r) {
        ctx.save();
        // Форма яблока с ямочкой сверху и снизу
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.72);
        ctx.bezierCurveTo(r * 0.45, -r * 0.98, r * 1.05, -r * 0.5, r * 0.98, r * 0.2);
        ctx.bezierCurveTo(r * 0.95, r * 0.8, r * 0.45, r * 0.98, 0, r * 0.88);
        ctx.bezierCurveTo(-r * 0.45, r * 0.98, -r * 0.95, r * 0.8, -r * 0.98, r * 0.2);
        ctx.bezierCurveTo(-r * 1.05, -r * 0.5, -r * 0.45, -r * 0.98, 0, -r * 0.72);
        ctx.closePath();

        const grad = ctx.createRadialGradient(-r * 0.25, -r * 0.2, r * 0.1, 0, 0, r * 1.05);
        grad.addColorStop(0, '#fff176');
        grad.addColorStop(0.35, '#ffb300');
        grad.addColorStop(0.65, '#e53935');
        grad.addColorStop(1, '#8e0000');
        ctx.fillStyle = grad;
        ctx.fill();

        // Блик
        ctx.beginPath();
        ctx.ellipse(-r * 0.42, -r * 0.3, r * 0.3, r * 0.14, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
        ctx.fill();

        // Ямочка сверху
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.72, r * 0.18, r * 0.08, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(70, 20, 10, 0.45)';
        ctx.fill();

        // Коричневый черешок
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.72);
        ctx.quadraticCurveTo(r * 0.15, -r * 1.05, r * 0.05, -r * 1.25);
        ctx.lineWidth = r * 0.11;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#4e342e';
        ctx.stroke();

        // Свежий зеленый листочек с прожилкой
        ctx.save();
        ctx.translate(r * 0.12, -r * 0.98);
        ctx.rotate(Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(r * 0.35, -r * 0.25, r * 0.5, 0);
        ctx.quadraticCurveTo(r * 0.35, r * 0.25, 0, 0);
        ctx.fillStyle = '#43a047';
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(r * 0.46, 0);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#2e7d32';
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    }

    // 4. ДАЧНЫЙ КАБАЧОК
    drawZucchini(ctx, r) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(-r * 0.28, -r * 0.28, r * 0.1, 0, 0, r);
        grad.addColorStop(0, '#dce775');
        grad.addColorStop(0.35, '#9ccc65');
        grad.addColorStop(0.7, '#689f38');
        grad.addColorStop(1, '#33691e');
        ctx.fillStyle = grad;
        ctx.fill();

        // Нежные светлые продольные полосочки кабачка
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
        ctx.clip();
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.ellipse(i * r * 0.25, 0, r * 0.08, r * 0.92, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(230, 255, 180, 0.25)';
            ctx.fill();
        }
        ctx.restore();

        // Крапинки
        for (let j = 0; j < 14; j++) {
            const angle = j * 0.5;
            const dist = (0.2 + (j % 4) * 0.2) * r;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, r * 0.025, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(240, 255, 200, 0.4)';
            ctx.fill();
        }

        // Блик
        ctx.beginPath();
        ctx.ellipse(-r * 0.4, -r * 0.38, r * 0.32, r * 0.16, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();

        // Хвостик-плодоножка кабачка
        ctx.beginPath();
        ctx.moveTo(-r * 0.1, -r * 0.9);
        ctx.lineTo(-r * 0.12, -r * 1.18);
        ctx.lineTo(r * 0.12, -r * 1.18);
        ctx.lineTo(r * 0.1, -r * 0.9);
        ctx.closePath();
        ctx.fillStyle = '#558b2f';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, -r * 1.18, r * 0.12, r * 0.05, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#7cb342';
        ctx.fill();

        ctx.restore();
    }

    // 5. СПЕЛАЯ ТЫКВА
    drawPumpkin(ctx, r) {
        ctx.save();
        // Сегменты тыквы с объемными ребрами
        const lobes = 6;
        for (let i = lobes - 1; i >= 0; i--) {
            const angleOffset = ((i - (lobes - 1) / 2) / lobes) * 1.1;
            const lobeX = Math.sin(angleOffset) * r * 0.75;
            const lobeWidth = r * (0.42 + (1 - Math.abs(angleOffset)) * 0.18);

            ctx.beginPath();
            ctx.ellipse(lobeX, 0, lobeWidth, r * 0.94, 0, 0, Math.PI * 2);

            const lobeGrad = ctx.createRadialGradient(lobeX - r * 0.15, -r * 0.25, r * 0.05, lobeX, 0, r);
            lobeGrad.addColorStop(0, '#ffa726');
            lobeGrad.addColorStop(0.5, '#fb8c00');
            lobeGrad.addColorStop(0.85, '#e65100');
            lobeGrad.addColorStop(1, '#bf360c');
            ctx.fillStyle = lobeGrad;
            ctx.fill();

            // Тонкая тень между ребрами
            ctx.strokeStyle = 'rgba(120, 30, 0, 0.28)';
            ctx.lineWidth = r * 0.035;
            ctx.stroke();
        }

        // Блик на центральном сегменте
        ctx.beginPath();
        ctx.ellipse(-r * 0.25, -r * 0.35, r * 0.35, r * 0.18, -Math.PI / 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();

        // Мощный деревянный стебель с завитком
        ctx.beginPath();
        ctx.moveTo(-r * 0.09, -r * 0.88);
        ctx.bezierCurveTo(-r * 0.12, -r * 1.25, r * 0.2, -r * 1.25, r * 0.15, -r * 1.35);
        ctx.bezierCurveTo(r * 0.08, -r * 1.4, -r * 0.05, -r * 1.25, 0, -r * 0.88);
        ctx.fillStyle = '#4e342e';
        ctx.fill();

        // Зеленый усик тыквы (завитушка)
        ctx.beginPath();
        ctx.arc(r * 0.25, -r * 1.05, r * 0.18, 0, Math.PI * 1.5);
        ctx.lineWidth = r * 0.04;
        ctx.strokeStyle = '#689f38';
        ctx.stroke();

        ctx.restore();
    }

    // 6. БАНКА С ОГУРЦАМИ (Закатка)
    drawPickleJar(ctx, r) {
        ctx.save();
        // Корпус стеклянной банки
        const w = r * 0.88;
        const h = r * 0.95;

        // Внутреннее содержимое (рассол)
        ctx.beginPath();
        ctx.roundRect(-w, -h * 0.65, w * 2, h * 1.6, [10, 10, 28, 28]);
        const brineGrad = ctx.createLinearGradient(0, -h, 0, h);
        brineGrad.addColorStop(0, '#c5e1a5');
        brineGrad.addColorStop(0.6, '#aed581');
        brineGrad.addColorStop(1, '#81c784');
        ctx.fillStyle = brineGrad;
        ctx.fill();

        // Огурчики внутри банки
        const jarPickles = [
            { x: -r * 0.42, y: r * 0.3, rot: -0.4, len: r * 0.55 },
            { x: r * 0.4, y: r * 0.28, rot: 0.35, len: r * 0.52 },
            { x: -r * 0.05, y: r * 0.45, rot: 0.05, len: r * 0.58 },
            { x: -r * 0.28, y: -r * 0.15, rot: 0.2, len: r * 0.48 },
            { x: r * 0.25, y: -r * 0.1, rot: -0.25, len: r * 0.5 }
        ];

        jarPickles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.beginPath();
            ctx.roundRect(-r * 0.15, -p.len / 2, r * 0.3, p.len, r * 0.14);
            ctx.fillStyle = '#388e3c';
            ctx.fill();
            ctx.strokeStyle = '#2e7d32';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Пупырышки на маринованных огурчиках
            ctx.fillStyle = '#66bb6a';
            ctx.beginPath();
            ctx.arc(0, -p.len * 0.2, r * 0.04, 0, Math.PI * 2);
            ctx.arc(-r * 0.06, p.len * 0.1, r * 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Зонтик укропа и горошины перца
        ctx.fillStyle = '#263238';
        [[-r * 0.5, r * 0.7], [r * 0.5, r * 0.65], [0, r * 0.8], [r * 0.15, -r * 0.3]].forEach(([px, py]) => {
            ctx.beginPath();
            ctx.arc(px, py, r * 0.045, 0, Math.PI * 2);
            ctx.fill();
        });

        // Укропный зонтик
        ctx.strokeStyle = '#9e9d24';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(r * 0.1, -r * 0.4);
        for (let a = -0.8; a <= 0.8; a += 0.4) {
            ctx.lineTo(r * 0.1 + Math.sin(a) * r * 0.28, -r * 0.4 - Math.cos(a) * r * 0.22);
            ctx.moveTo(r * 0.1, -r * 0.4);
        }
        ctx.stroke();

        // Стеклянные блики на банке
        ctx.beginPath();
        ctx.moveTo(-w + r * 0.12, -h * 0.55);
        ctx.lineTo(-w + r * 0.12, h * 0.75);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = r * 0.09;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Тонкий второй блик
        ctx.beginPath();
        ctx.moveTo(-w + r * 0.25, -h * 0.4);
        ctx.lineTo(-w + r * 0.25, h * 0.6);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = r * 0.035;
        ctx.stroke();

        // Контур стекла
        ctx.beginPath();
        ctx.roundRect(-w, -h * 0.65, w * 2, h * 1.6, [10, 10, 28, 28]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Винтажная этикетка: "ХРУСТЯЩИЕ"
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(-r * 0.55, -r * 0.08, r * 1.1, r * 0.38, 4);
        ctx.fillStyle = '#fff9c4';
        ctx.fill();
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#3e2723';
        ctx.font = `bold ${Math.round(r * 0.15)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ОГУРЧИКИ', 0, r * 0.11);
        ctx.restore();

        // Крышка с красно-белой дачной салфеткой в клетку
        this.drawJarLid(ctx, r, '#e53935');

        ctx.restore();
    }

    // 7. ЗОЛОТАЯ БАНКА ВАРЕНЬЯ (ДЖЕКПОТ!)
    drawGoldenJar(ctx, r) {
        ctx.save();
        const w = r * 0.88;
        const h = r * 0.95;

        // Внешнее волшебное золотое свечение
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.08, 0, Math.PI * 2);
        const glowGrad = ctx.createRadialGradient(0, 0, r * 0.7, 0, 0, r * 1.15);
        glowGrad.addColorStop(0, 'rgba(255, 215, 0, 0.45)');
        glowGrad.addColorStop(0.7, 'rgba(255, 179, 0, 0.2)');
        glowGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fill();
        ctx.restore();

        // Корпус банки с малиновым / янтарным вареньем
        ctx.beginPath();
        ctx.roundRect(-w, -h * 0.65, w * 2, h * 1.6, [12, 12, 30, 30]);
        const jamGrad = ctx.createLinearGradient(0, -h, 0, h);
        jamGrad.addColorStop(0, '#ff1744');
        jamGrad.addColorStop(0.4, '#c2185b');
        jamGrad.addColorStop(0.85, '#880e4f');
        jamGrad.addColorStop(1, '#4a0072');
        ctx.fillStyle = jamGrad;
        ctx.fill();

        // Плавающие ягодки малины в варенье
        ctx.fillStyle = '#ff4081';
        [[-r * 0.35, -r * 0.1], [r * 0.3, 0], [0, r * 0.35], [-r * 0.25, r * 0.55], [r * 0.28, r * 0.6]].forEach(([bx, by]) => {
            ctx.beginPath();
            ctx.arc(bx, by, r * 0.1, 0, Math.PI * 2);
            ctx.fill();
        });

        // Стеклянные блики
        ctx.beginPath();
        ctx.moveTo(-w + r * 0.12, -h * 0.55);
        ctx.lineTo(-w + r * 0.12, h * 0.75);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = r * 0.09;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.roundRect(-w, -h * 0.65, w * 2, h * 1.6, [12, 12, 30, 30]);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Золотая табличка: "ДЖЕКПОТ"
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(-r * 0.65, -r * 0.1, r * 1.3, r * 0.42, 6);
        const goldGrad = ctx.createLinearGradient(-r * 0.65, 0, r * 0.65, 0);
        goldGrad.addColorStop(0, '#ffd700');
        goldGrad.addColorStop(0.5, '#fff9c4');
        goldGrad.addColorStop(1, '#ffb300');
        ctx.fillStyle = goldGrad;
        ctx.fill();
        ctx.strokeStyle = '#bf360c';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#bf360c';
        ctx.font = `900 ${Math.round(r * 0.16)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★ ДЖЕКПОТ ★', 0, r * 0.11);
        ctx.restore();

        // Золотая крышка с золотой салфеткой и бантом
        this.drawJarLid(ctx, r, '#ffd700', true);

        // Золотые звездочки вокруг банки
        this.drawSparkle(ctx, -r * 0.75, -r * 0.6, r * 0.22);
        this.drawSparkle(ctx, r * 0.78, -r * 0.45, r * 0.25);
        this.drawSparkle(ctx, r * 0.7, r * 0.55, r * 0.18);
        this.drawSparkle(ctx, -r * 0.7, r * 0.65, r * 0.16);

        ctx.restore();
    }

    // Крышка банки с салфеткой и бечевкой
    drawJarLid(ctx, r, capColor, isGold = false) {
        ctx.save();
        const capW = r * 0.85;
        const capY = -r * 0.68;

        // Салфетка с волнистым краем
        ctx.beginPath();
        ctx.moveTo(-capW, capY);
        ctx.quadraticCurveTo(0, capY - r * 0.15, capW, capY);
        ctx.lineTo(capW * 1.08, capY + r * 0.25);

        // Юбочка салфетки
        const frills = 8;
        const step = (capW * 2.16) / frills;
        for (let i = 0; i < frills; i++) {
            const startX = capW * 1.08 - i * step;
            const endX = startX - step;
            ctx.quadraticCurveTo(startX - step / 2, capY + r * 0.35, endX, capY + r * 0.25);
        }
        ctx.closePath();

        ctx.fillStyle = capColor;
        ctx.fill();

        // Если не золото, нарисуем уютную деревенскую клеточку!
        if (!isGold) {
            ctx.save();
            ctx.clip();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 2.5;
            for (let x = -capW * 1.2; x <= capW * 1.2; x += r * 0.14) {
                ctx.beginPath();
                ctx.moveTo(x, capY - r * 0.3);
                ctx.lineTo(x, capY + r * 0.5);
                ctx.stroke();
            }
            for (let y = capY - r * 0.3; y <= capY + r * 0.5; y += r * 0.14) {
                ctx.beginPath();
                ctx.moveTo(-capW * 1.2, y);
                ctx.lineTo(capW * 1.2, y);
                ctx.stroke();
            }
            ctx.restore();
        }

        // Веревочка / бечевка с бантиком
        ctx.beginPath();
        ctx.ellipse(0, capY + r * 0.16, capW * 0.95, r * 0.06, 0, 0, Math.PI * 2);
        ctx.strokeStyle = isGold ? '#d84315' : '#795548';
        ctx.lineWidth = r * 0.06;
        ctx.stroke();

        // Бантик по центру
        ctx.fillStyle = isGold ? '#d84315' : '#8d6e63';
        ctx.beginPath();
        ctx.arc(-r * 0.1, capY + r * 0.16, r * 0.07, 0, Math.PI * 2);
        ctx.arc(r * 0.1, capY + r * 0.16, r * 0.07, 0, Math.PI * 2);
        ctx.arc(0, capY + r * 0.16, r * 0.05, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Листики / чашелистик
    drawCalyx(ctx, r, numPoints, col1, col2) {
        ctx.save();
        for (let i = 0; i < numPoints; i++) {
            const angle = (i * Math.PI * 2) / numPoints;
            ctx.save();
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-r * 0.08, -r * 0.25, 0, -r * 0.38);
            ctx.quadraticCurveTo(r * 0.08, -r * 0.25, 0, 0);
            ctx.fillStyle = i % 2 === 0 ? col1 : col2;
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }

    // Сияющая 4-лучевая звездочка
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
