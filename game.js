/**
 * Дачный Погребок: Закатки на зиму
 * Главная игровая логика с поддержкой стандартов game-juice:
 * 1. Squash & Stretch (объемное сплющивание при соударениях)
 * 2. Trauma Screen Shake (экспоненциальная микродрожь камеры при крупных слияниях)
 * 3. Juice Particle Bursts (брызги рассола и золотые искры)
 * 4. Spring Floating Scores (пружинящие всплывающие очки в точке слияния)
 */

(function () {
    'use strict';

    // Константы игрового поля
    const WIDTH = 400;
    const HEIGHT = 660;
    const JAR_LEFT = 28;
    const JAR_RIGHT = 372;
    const JAR_BOTTOM = 628;
    const JAR_TOP = 135;
    const DANGER_Y = 175;
    const DROP_Y = 82;

    // --- GAME JUICE: 1. Squash & Stretch (Сохранение объема: scaleX * scaleY = 1) ---
    class FruitJuice {
        constructor() {
            this.scaleX = 1.0;
            this.scaleY = 1.0;
            this.squashVelocity = 0;
            this.spawnScale = 0.35; // Эффект упругого рождения
            this.spawnVel = 0;
        }

        triggerSquash(intensity = 0.22) {
            const clamped = Math.min(Math.max(intensity, 0.08), 0.38);
            this.scaleY = Math.max(0.62, 1.0 - clamped);
            this.scaleX = 1.0 / this.scaleY;
            this.squashVelocity = -clamped * 12;
        }

        update(dt = 1 / 60) {
            // Пружина колебаний сплющивания к 1.0
            const k = 220; // Жесткость пружины
            const d = 16;  // Затухание

            const forceY = -k * (this.scaleY - 1.0) - d * this.squashVelocity;
            this.squashVelocity += forceY * dt;
            this.scaleY += this.squashVelocity * dt;
            this.scaleX = 1.0 / Math.max(0.3, this.scaleY);

            if (Math.abs(this.scaleY - 1.0) < 0.005 && Math.abs(this.squashVelocity) < 0.01) {
                this.scaleX = 1.0;
                this.scaleY = 1.0;
                this.squashVelocity = 0;
            }

            // Пружина появления нового плода (0.35 -> 1.15 -> 1.0)
            if (this.spawnScale < 1.0 || Math.abs(this.spawnVel) > 0.01) {
                const kSpawn = 260;
                const dSpawn = 18;
                const fSpawn = -kSpawn * (this.spawnScale - 1.0) - dSpawn * this.spawnVel;
                this.spawnVel += fSpawn * dt;
                this.spawnScale += this.spawnVel * dt;
                if (Math.abs(this.spawnScale - 1.0) < 0.005 && Math.abs(this.spawnVel) < 0.01) {
                    this.spawnScale = 1.0;
                    this.spawnVel = 0;
                }
            }
        }
    }

    // --- GAME JUICE: 2. Trauma Screen Shake (Экспоненциальное затухание тряски) ---
    class ScreenShake {
        constructor() {
            this.trauma = 0;
            this.maxOffset = 12;  // Максимальное смещение в пикселях
            this.maxAngle = 0.035;// Максимальный угол наклона камеры в радианах
        }

        addTrauma(amount) {
            this.trauma = Math.min(1.0, this.trauma + amount);
        }

        update(dt = 1 / 60) {
            if (this.trauma > 0) {
                this.trauma = Math.max(0, this.trauma - 1.9 * dt);
            }
        }

        apply(ctx) {
            if (this.trauma <= 0.001) return;
            const shake = this.trauma * this.trauma; // Нелинейная квадратичная сила удара
            const offsetX = (Math.random() * 2 - 1) * this.maxOffset * shake;
            const offsetY = (Math.random() * 2 - 1) * this.maxOffset * shake;
            const angle = (Math.random() * 2 - 1) * this.maxAngle * shake;

            ctx.translate(WIDTH / 2, HEIGHT / 2);
            ctx.translate(offsetX, offsetY);
            ctx.rotate(angle);
            ctx.translate(-WIDTH / 2, -HEIGHT / 2);
        }
    }

    // --- GAME JUICE: 3. Сочные партиклы и ударные кольца ---
    class ParticleSystem {
        constructor() {
            this.particles = [];
            this.rings = [];
        }

        spawnMergeBurst(x, y, color = '#ffd700', count = 22, maxSpeed = 5.5, ringMaxR = 48) {
            this.rings.push({
                x,
                y,
                r: Math.max(8, ringMaxR * 0.22),
                maxR: ringMaxR,
                alpha: 0.85,
                color
            });

            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1.8 + Math.random() * maxSpeed;
                const isBrineDrop = Math.random() > 0.45;
                this.particles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 2.0, // Импульс вверх
                    radius: isBrineDrop ? 3.0 + Math.random() * 3.5 : 2.0 + Math.random() * 2.5,
                    color: isBrineDrop ? color : '#fff9c4',
                    alpha: 1.0,
                    decay: 0.022 + Math.random() * 0.025,
                    isStar: !isBrineDrop,
                    isBrine: isBrineDrop
                });
            }
        }

        updateAndDraw(ctx, dt = 1 / 60) {
            // Ударные световые кольца слияния
            for (let i = this.rings.length - 1; i >= 0; i--) {
                const ring = this.rings[i];
                ring.r += (ring.maxR - ring.r) * Math.min(1, 14 * dt);
                ring.alpha -= 2.6 * dt;
                if (ring.alpha <= 0.02) {
                    this.rings.splice(i, 1);
                    continue;
                }
                ctx.save();
                ctx.globalAlpha = Math.max(0, ring.alpha);
                ctx.strokeStyle = ring.color;
                ctx.lineWidth = Math.max(1.5, 5.5 * ring.alpha);
                ctx.beginPath();
                ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.16; // Гравитация капель
                p.vx *= 0.96; // Сопротивление воздуха
                p.alpha -= p.decay;

                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.fillStyle = p.color;

                if (p.isStar) {
                    // Золотая 4-лучевая искра
                    ctx.translate(p.x, p.y);
                    const s = p.radius * 1.5;
                    ctx.beginPath();
                    ctx.moveTo(0, -s);
                    ctx.quadraticCurveTo(0, 0, s, 0);
                    ctx.quadraticCurveTo(0, 0, 0, s);
                    ctx.quadraticCurveTo(0, 0, -s, 0);
                    ctx.quadraticCurveTo(0, 0, 0, -s);
                    ctx.fill();
                } else {
                    // Сочная капля рассола / сока
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }
        }
    }

    // --- GAME JUICE: 4. Пружинящие всплывающие цифры очков ---
    class ScorePopupManager {
        constructor() {
            this.popups = [];
        }

        add(x, y, text, color = '#ffd54f', fontSize = 24) {
            this.popups.push({
                x,
                y,
                text,
                color,
                fontSize,
                vy: -3.2,
                scale: 1.6, // Начальный пружинный всплеск
                alpha: 1.0,
                life: 0
            });
        }

        updateAndDraw(ctx, dt = 1 / 60) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            for (let i = this.popups.length - 1; i >= 0; i--) {
                const p = this.popups[i];
                p.y += p.vy;
                p.vy *= 0.93; // Плавное замедление всплытия
                p.scale = Math.max(1.0, p.scale - 0.06); // Возврат к нормальному размеру
                p.life += 0.024;
                p.alpha = Math.max(0, 1.0 - p.life);

                if (p.alpha <= 0) {
                    this.popups.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.scale(p.scale, p.scale);
                ctx.globalAlpha = p.alpha;
                ctx.font = `900 ${p.fontSize}px "Rubik", "Nunito", sans-serif`;

                // Жирный темный контур для идеального контраста (45-70+)
                ctx.lineWidth = 4.5;
                ctx.strokeStyle = '#2d1810';
                ctx.strokeText(p.text, 0, 0);

                ctx.fillStyle = p.color;
                ctx.fillText(p.text, 0, 0);

                ctx.restore();
            }
            ctx.restore();
        }
    }

    // Состояние игры
    let engine, world;
    let canvas, ctx;
    let fruits = [];
    const screenShake = new ScreenShake();
    const particleSys = new ParticleSystem();
    const scorePopups = new ScorePopupManager();

    let bridge = null;
    let currentTier = 0;
    let nextTier = 1;
    let aimX = WIDTH / 2;
    let canDrop = true;
    let isGameOver = false;
    let isPaused = false;
    let score = 0;
    let highScore = parseInt(localStorage.getItem('dacha_high_score') || '0', 10);
    let totalJarsCrafted = parseInt(localStorage.getItem('dacha_jars_count') || '0', 10);

    // Бустеры и второе дыхание ("Спасти урожай")
    let scoopCharges = 1;
    let shakeCharges = 1;
    let isScoopMode = false;
    let rescueUsedThisRun = false;

    // Таймер опасности (3 секунды) и фиксированный шаг физики (120 Гц)
    let dangerTime = 0;
    const DANGER_MAX_TIME = 3.0;
    let isDangerActive = false;
    let physicsAccumulator = 0;
    const FIXED_PHYSICS_STEP = 1 / 120;

    // Ссылки на элементы UI
    let scoreEl, bestScoreEl, dropBtn, soundBtn, musicBtn, dangerBannerEl, dangerProgressEl;
    let scoopBtn, shakeBtn, scoopBadge, shakeBadge, scoopBannerEl, scoopCancelBtn, rescueBtn;
    let isAiming = false;

    const SVG_VIDEO_BADGE = '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4"/></svg><span>+1</span>';

    // Инициализация
    function init() {
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');

        scoreEl = document.getElementById('scoreValue');
        bestScoreEl = document.getElementById('bestValue');
        dangerBannerEl = document.getElementById('dangerBanner');
        dangerProgressEl = document.getElementById('dangerProgress');
        dropBtn = document.getElementById('dropBtn');
        soundBtn = document.getElementById('soundBtn');
        musicBtn = document.getElementById('musicBtn');
        scoopBtn = document.getElementById('scoopBtn');
        shakeBtn = document.getElementById('shakeBtn');
        scoopBadge = document.getElementById('scoopBadge');
        shakeBadge = document.getElementById('shakeBadge');
        scoopBannerEl = document.getElementById('scoopBanner');
        scoopCancelBtn = document.getElementById('scoopCancelBtn');
        rescueBtn = document.getElementById('rescueBtn');

        bridge = window.SocialBridge
            ? new window.SocialBridge('dacha', { audio: window.soundEffects })
            : null;

        if (bridge) {
            bridge.hydrateCloudProgress(['high_score', 'jars_count'], (hydrated) => {
                if (typeof hydrated.high_score === 'number' && hydrated.high_score > highScore) {
                    highScore = hydrated.high_score;
                    try { localStorage.setItem('dacha_high_score', String(highScore)); } catch (_) {}
                    updateScoreDisplays();
                }
                if (typeof hydrated.jars_count === 'number' && hydrated.jars_count > totalJarsCrafted) {
                    totalJarsCrafted = hydrated.jars_count;
                    try { localStorage.setItem('dacha_jars_count', String(totalJarsCrafted)); } catch (_) {}
                }
            });
        }

        updateScoreDisplays();
        updateBoosterUI();
        syncAudioButtons();

        // Инициализация векторных спрайтов
        window.spriteRenderer.init();

        // Физика Matter.js
        setupPhysics();

        // Подготовка плодов
        pickNextFruits();
        renderNextPreview();

        // Управление и автозапуск уютной музыки при первом касании
        setupControls();
        document.addEventListener('pointerdown', () => {
            window.soundEffects.init();
            window.soundEffects.startAmbientMusic();
        }, { once: true });

        // Игровой цикл
        let lastTime = performance.now();
        function loop(now) {
            const dt = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;

            if (!isPaused && !isGameOver) {
                update(dt);
            }
            render(dt);

            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }

    function setupPhysics() {
        const Engine = Matter.Engine;
        const World = Matter.World;
        const Bodies = Matter.Bodies;

        engine = Engine.create({
            enableSleeping: false,
            positionIterations: 10,
            velocityIterations: 8,
            constraintIterations: 4,
            gravity: { x: 0, y: 1.65, scale: 0.001 }
        });
        world = engine.world;

        // Стенки банки со сверхнизким трением, чтобы плоды не "зависали" на стекле
        const wallThickness = 60;
        const leftWall = Bodies.rectangle(
            JAR_LEFT - wallThickness / 2,
            (JAR_TOP + JAR_BOTTOM) / 2,
            wallThickness,
            JAR_BOTTOM - JAR_TOP + 40,
            { isStatic: true, friction: 0.008, frictionStatic: 0.01, restitution: 0.12, slop: 0.01 }
        );

        const rightWall = Bodies.rectangle(
            JAR_RIGHT + wallThickness / 2,
            (JAR_TOP + JAR_BOTTOM) / 2,
            wallThickness,
            JAR_BOTTOM - JAR_TOP + 40,
            { isStatic: true, friction: 0.008, frictionStatic: 0.01, restitution: 0.12, slop: 0.01 }
        );

        const floor = Bodies.rectangle(
            WIDTH / 2,
            JAR_BOTTOM + wallThickness / 2,
            WIDTH,
            wallThickness,
            { isStatic: true, friction: 0.06, frictionStatic: 0.08, restitution: 0.10, slop: 0.01 }
        );

        // Плавные дугообразные скругления дна банки (радиус 36px, точно по стеклу)
        const cornerBodies = [];
        const arcR = 36;
        const blockHalf = 10;
        [
            { cx: JAR_LEFT + arcR, cy: JAR_BOTTOM - arcR, start: Math.PI / 2, end: Math.PI },
            { cx: JAR_RIGHT - arcR, cy: JAR_BOTTOM - arcR, start: 0, end: Math.PI / 2 }
        ].forEach((c) => {
            [0.25, 0.5, 0.75].forEach((t) => {
                const a = c.start + (c.end - c.start) * t;
                const bx = c.cx + Math.cos(a) * (arcR + blockHalf);
                const by = c.cy + Math.sin(a) * (arcR + blockHalf);
                cornerBodies.push(Bodies.rectangle(bx, by, 22, blockHalf * 2, {
                    isStatic: true,
                    angle: a + Math.PI / 2,
                    friction: 0.01,
                    frictionStatic: 0.01,
                    restitution: 0.10,
                    slop: 0.01
                }));
            });
        });

        World.add(world, [leftWall, rightWall, floor, ...cornerBodies]);

        // Обработка соударений (звук и сплющивание на start; слияние на start и active)
        Matter.Events.on(engine, 'collisionStart', function (event) {
            const pairs = event.pairs;
            for (let i = 0; i < pairs.length; i++) {
                handleCollision(pairs[i].bodyA, pairs[i].bodyB, true);
            }
        });

        Matter.Events.on(engine, 'collisionActive', function (event) {
            const pairs = event.pairs;
            for (let i = 0; i < pairs.length; i++) {
                handleCollision(pairs[i].bodyA, pairs[i].bodyB, false);
            }
        });
    }

    function createFruitBody(x, y, tier, opts = {}) {
        const radius = FRUIT_DEFS[tier].radius;
        const clampedX = Math.min(Math.max(x, JAR_LEFT + radius + 2), JAR_RIGHT - radius - 2);
        const clampedY = Math.min(y, JAR_BOTTOM - radius - 2);

        const body = Matter.Bodies.circle(clampedX, clampedY, radius, {
            restitution: 0.14,
            friction: 0.025,
            frictionStatic: 0.035,
            frictionAir: 0.005,
            slop: 0.01,
            density: 0.0018 + tier * 0.00035,
            fruitTier: tier,
            spawnTime: performance.now()
        });

        body.juice = new FruitJuice();
        body.juice.spawnScale = opts.spawnScale !== undefined ? opts.spawnScale : 1.0;
        if (opts.squash) {
            body.juice.triggerSquash(opts.squash);
        }
        return body;
    }

    function getRandomSpawnTier() {
        const weights = [0.42, 0.32, 0.18, 0.08]; // Клубника, Огурец, Помидор, Яблоко
        const r = Math.random();
        let acc = 0;
        for (let i = 0; i < weights.length; i++) {
            acc += weights[i];
            if (r <= acc) return i;
        }
        return 0;
    }

    function pickNextFruits() {
        currentTier = nextTier !== undefined ? nextTier : getRandomSpawnTier();
        nextTier = getRandomSpawnTier();
        renderNextPreview();
    }

    function renderNextPreview() {
        const pCanvas = document.getElementById('nextFruitCanvas');
        if (!pCanvas) return;
        const pCtx = pCanvas.getContext('2d');
        pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);

        const def = FRUIT_DEFS[nextTier];
        const sprite = window.spriteRenderer.getSprite(nextTier);
        if (sprite) {
            const size = Math.min(pCanvas.width * 0.85, def.radius * 1.5);
            pCtx.drawImage(
                sprite,
                (pCanvas.width - size) / 2,
                (pCanvas.height - size) / 2,
                size,
                size
            );
        }
    }

    // Сброс плода в банку
    function dropFruit() {
        if (!canDrop || isGameOver || isPaused) return;

        canDrop = false;
        const body = createFruitBody(aimX, DROP_Y, currentTier, { spawnScale: 1.0 });

        Matter.World.add(world, body);
        fruits.push(body);

        // Звук мягкого падения
        window.soundEffects.playDrop(2.0);

        // Подготовка следующего с задержкой 520мс
        setTimeout(() => {
            if (!isGameOver) {
                pickNextFruits();
                canDrop = true;
            }
        }, 520);
    }

    // Обработка соударений и слияний
    function handleCollision(bodyA, bodyB, isStart = true) {
        if (isStart) {
            const maxSpd = Math.max(bodyA.speed || 0, bodyB.speed || 0);

            // Звук глухого удара о дно/стенки/плоды
            if (maxSpd > 1.0) {
                window.soundEffects.playDrop(maxSpd);
            }

            // GAME JUICE: Активируем Squash & Stretch при сильном ударе
            if (maxSpd > 1.2) {
                const squashAmt = Math.min(maxSpd * 0.045, 0.32);
                if (bodyA.juice) bodyA.juice.triggerSquash(squashAmt);
                if (bodyB.juice) bodyB.juice.triggerSquash(squashAmt);
            }
        }

        if (bodyA.fruitTier === undefined || bodyB.fruitTier === undefined) return;
        if (bodyA.isMerging || bodyB.isMerging) return;

        // Если плоды одного уровня — производим слияние!
        if (bodyA.fruitTier === bodyB.fruitTier) {
            mergeFruits(bodyA, bodyB);
        }
    }

    function mergeFruits(bodyA, bodyB) {
        if (!bodyA || !bodyB || bodyA.isMerging || bodyB.isMerging) return;
        if (bodyA.fruitTier === undefined || bodyA.fruitTier !== bodyB.fruitTier) return;

        const tier = bodyA.fruitTier;
        bodyA.isMerging = true;
        bodyB.isMerging = true;

        const midX = (bodyA.position.x + bodyB.position.x) / 2;
        const midY = (bodyA.position.y + bodyB.position.y) / 2;

        // Двойной золотой джекпот
        if (tier === 7) {
            mergeGoldenJackpots(bodyA, bodyB, midX, midY);
            return;
        }

        const nextT = tier + 1;
        const nextRadius = FRUIT_DEFS[nextT].radius;
        const points = FRUIT_DEFS[nextT].score;
        addScore(points);

        // ЗВУК: ASMR Vacuum Cork Pop с гармонической пентатоникой
        window.soundEffects.playMerge(nextT);

        // GAME JUICE: Тряска экрана в зависимости от ранга плода
        const shakeTrauma = [0.08, 0.12, 0.18, 0.28, 0.42, 0.60, 0.85, 1.0][nextT] || 0.1;
        screenShake.addTrauma(shakeTrauma);

        // GAME JUICE: Всплывающие пружинящие цифры очков
        scorePopups.add(midX, midY - 15, `+${points}`, FRUIT_DEFS[nextT].color, nextT >= 5 ? 28 : 22);

        // GAME JUICE: Взрыв сочных партиклов и ударная волна
        particleSys.spawnMergeBurst(midX, midY, FRUIT_DEFS[nextT].color, nextT >= 6 ? 36 : 22, 5.5, nextRadius * 1.45);

        if (nextT === 6) {
            totalJarsCrafted++;
            if (bridge) {
                bridge.saveCloudProgress('jars_count', totalJarsCrafted);
            } else {
                localStorage.setItem('dacha_jars_count', totalJarsCrafted);
            }
            window.soundEffects.playJarSuccess();
            triggerJarCelebration(midX, midY, 'Закатана банка огурцов!');
        } else if (nextT === 7) {
            totalJarsCrafted++;
            if (bridge) {
                bridge.saveCloudProgress('jars_count', totalJarsCrafted);
            } else {
                localStorage.setItem('dacha_jars_count', totalJarsCrafted);
            }
            window.soundEffects.playJackpot();
            triggerJarCelebration(midX, midY, 'ЗОЛОТОЙ ДЖЕКПОТ!', true);
        }

        // Удаляем старые тела
        Matter.World.remove(world, [bodyA, bodyB]);
        fruits = fruits.filter(f => f !== bodyA && f !== bodyB);

        // Создаём новый плод с лёгким упругим отскоком, не разбрасывая соседей
        const newBody = createFruitBody(midX, midY, nextT, { spawnScale: 0.35, squash: 0.25 });
        Matter.Body.setVelocity(newBody, { x: (Math.random() - 0.5) * 0.6, y: -0.75 });

        Matter.World.add(world, newBody);
        fruits.push(newBody);
    }

    // Гарантированное слияние близких/соприкасающихся близнецов + мягкий «магнитный поцелуй»
    function checkProximityMerges() {
        for (let i = 0; i < fruits.length; i++) {
            const fA = fruits[i];
            if (!fA || fA.isMerging) continue;
            for (let j = i + 1; j < fruits.length; j++) {
                const fB = fruits[j];
                if (!fB || fB.isMerging) continue;
                if (fA.fruitTier !== fB.fruitTier) continue;

                const dx = fB.position.x - fA.position.x;
                const dy = fB.position.y - fA.position.y;
                const dist = Math.hypot(dx, dy);
                const touchDist = fA.circleRadius + fB.circleRadius;

                if (dist <= touchDist + 3.0) {
                    mergeFruits(fA, fB);
                    break;
                } else if (dist < touchDist + 9.0 && dist > 0.001) {
                    const pull = 0.00018 * (fA.mass + fB.mass);
                    const nx = dx / dist;
                    const ny = dy / dist;
                    Matter.Body.applyForce(fA, fA.position, { x: nx * pull, y: ny * pull });
                    Matter.Body.applyForce(fB, fB.position, { x: -nx * pull, y: -ny * pull });
                }
            }
        }
    }

    // Двойной золотой джекпот
    function mergeGoldenJackpots(bodyA, bodyB, x, y) {
        addScore(1000);
        window.soundEffects.playJackpot();
        screenShake.addTrauma(1.0); // Максимальная тряска
        scorePopups.add(x, y - 25, '+1000 СУПЕР ПРИЗ!', '#ffd700', 32);
        particleSys.spawnMergeBurst(x, y, '#ffd700', 65, 7.5);

        Matter.World.remove(world, [bodyA, bodyB]);
        fruits = fruits.filter(f => f !== bodyA && f !== bodyB);

        triggerJarCelebration(x, y, 'ВЕЛИКИЙ ДАЧНЫЙ УРОЖАЙ!', true);
    }

    function addScore(pts) {
        score += pts;
        if (score > highScore) {
            highScore = score;
            if (bridge) {
                bridge.saveCloudProgress('high_score', highScore);
            } else {
                localStorage.setItem('dacha_high_score', highScore);
            }
        }
        updateScoreDisplays();
    }

    function updateScoreDisplays() {
        if (scoreEl) scoreEl.textContent = score;
        if (bestScoreEl) bestScoreEl.textContent = highScore;
    }

    function triggerJarCelebration(x, y, text, isGold = false) {
        scorePopups.add(WIDTH / 2, DANGER_Y + 40, text, isGold ? '#ffd700' : '#4caf50', 28);
        particleSys.spawnMergeBurst(WIDTH / 2, DANGER_Y + 50, isGold ? '#ffd700' : '#81c784', 45, 6.0);
    }

    // Обновление физики и анимаций (фиксированный подшаг 120 Гц + магнитное слияние)
    function update(dt) {
        physicsAccumulator += Math.min(dt, 0.05);
        let substeps = 0;
        while (physicsAccumulator >= FIXED_PHYSICS_STEP && substeps < 6) {
            Matter.Engine.update(engine, FIXED_PHYSICS_STEP * 1000);
            physicsAccumulator -= FIXED_PHYSICS_STEP;
            substeps++;
        }

        checkProximityMerges();

        const now = performance.now();

        // GAME JUICE: Обновление Squash & Stretch для каждого плода
        for (let i = 0; i < fruits.length; i++) {
            if (fruits[i].juice) {
                fruits[i].juice.update(dt);
            }
        }

        // GAME JUICE: Обновление тряски экрана
        screenShake.update(dt);

        // Проверка критического переполнения
        let hasOverflowingFruit = false;
        for (let i = 0; i < fruits.length; i++) {
            const f = fruits[i];
            if (now - f.spawnTime < 1200) continue;

            const topEdge = f.position.y - f.circleRadius;
            if (topEdge < DANGER_Y && f.speed < 1.0) {
                hasOverflowingFruit = true;
                break;
            }
        }

        if (hasOverflowingFruit) {
            dangerTime += dt;
            isDangerActive = true;
            window.soundEffects.playDangerTick();

            if (dangerBannerEl) {
                dangerBannerEl.classList.remove('hidden');
                const remaining = Math.max(0, DANGER_MAX_TIME - dangerTime).toFixed(1);
                dangerBannerEl.querySelector('.timer-sec').textContent = `${remaining}с`;
            }
            if (dangerProgressEl) {
                const pct = Math.min(100, (dangerTime / DANGER_MAX_TIME) * 100);
                dangerProgressEl.style.width = `${pct}%`;
            }

            if (dangerTime >= DANGER_MAX_TIME) {
                triggerGameOver();
            }
        } else {
            if (dangerTime > 0) {
                dangerTime = Math.max(0, dangerTime - dt * 2.5);
                if (dangerProgressEl) {
                    const pct = (dangerTime / DANGER_MAX_TIME) * 100;
                    dangerProgressEl.style.width = `${pct}%`;
                }
            } else {
                isDangerActive = false;
                if (dangerBannerEl) {
                    dangerBannerEl.classList.add('hidden');
                }
            }
        }
    }

    // Отрисовка кадра
    function render(dt) {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        ctx.save();
        // GAME JUICE: Применяем микродрожь камеры
        screenShake.apply(ctx);

        // 1. Фон погребка
        drawCellarInterior();

        // 2. Линия прицеливания
        drawAimingGuide();

        // 3. Банка (задний полупрозрачный объем)
        drawJarBodyBack();

        // 4. Опасная черта
        drawDangerLine();

        // 5. Плоды с эффектом Squash & Stretch
        drawFruits();

        // 6. Передние глянцевые блики банки
        drawJarBodyFront();

        // 7. Подвешенный плод прицеливания
        drawCurrentDroppingFruit();

        // 8. Сочные партиклы (брызги рассола, золотые искры)
        particleSys.updateAndDraw(ctx, dt);

        // 9. Пружинящие всплывающие очки
        scorePopups.updateAndDraw(ctx, dt);

        ctx.restore();
    }

    function drawCellarInterior() {
        // Тёплая медовая древесина солнечного погребка
        const woodGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
        woodGrad.addColorStop(0, '#693d23');
        woodGrad.addColorStop(0.5, '#59331d');
        woodGrad.addColorStop(1, '#452614');
        ctx.fillStyle = woodGrad;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // Деревянные доски и тёплые полки
        for (let y = 76; y < HEIGHT; y += 94) {
            ctx.strokeStyle = 'rgba(32, 14, 5, 0.42)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(WIDTH, y);
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 224, 166, 0.08)';
            ctx.fillRect(0, y + 1, WIDTH, 3);
        }

        // Деликатные силуэты полок и заготовок в глубине (за главной банкой)
        ctx.save();
        ctx.fillStyle = 'rgba(34, 15, 5, 0.24)';
        ctx.fillRect(0, 170, WIDTH, 6);
        ctx.fillRect(0, 358, WIDTH, 6);
        // Мягкие силуэты банок по углам
        const bgJars = [
            { x: 10, y: 132, w: 18, h: 36, cap: 'rgba(229, 57, 53, 0.22)' },
            { x: 372, y: 128, w: 20, h: 40, cap: 'rgba(251, 191, 36, 0.24)' },
            { x: 6, y: 322, w: 20, h: 34, cap: 'rgba(102, 187, 106, 0.22)' },
            { x: 374, y: 320, w: 18, h: 36, cap: 'rgba(229, 57, 53, 0.22)' }
        ];
        bgJars.forEach(j => {
            ctx.fillStyle = 'rgba(255, 236, 179, 0.1)';
            ctx.beginPath();
            ctx.roundRect(j.x, j.y, j.w, j.h, 4);
            ctx.fill();
            ctx.fillStyle = j.cap;
            ctx.fillRect(j.x - 1, j.y - 4, j.w + 2, 6);
        });
        ctx.restore();

        // Тёплое золотистое сияние и солнечные лучи сверху
        const lightGrad = ctx.createRadialGradient(WIDTH / 2, 55, 36, WIDTH / 2, 220, 340);
        lightGrad.addColorStop(0, 'rgba(255, 240, 185, 0.34)');
        lightGrad.addColorStop(0.55, 'rgba(255, 193, 94, 0.12)');
        lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // Лёгкие диагональные солнечные лучи из оконца погребка
        ctx.save();
        const beamGrad = ctx.createLinearGradient(0, 0, WIDTH, 340);
        beamGrad.addColorStop(0, 'rgba(255, 248, 210, 0.12)');
        beamGrad.addColorStop(1, 'rgba(255, 248, 210, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(270, 0);
        ctx.lineTo(395, 0);
        ctx.lineTo(225, 360);
        ctx.lineTo(130, 360);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function drawJarBodyBack() {
        const jarW = JAR_RIGHT - JAR_LEFT;
        const jarH = JAR_BOTTOM - JAR_TOP;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(JAR_LEFT, JAR_TOP, jarW, jarH, [8, 8, 36, 36]);
        const innerGrad = ctx.createLinearGradient(JAR_LEFT, JAR_TOP, JAR_RIGHT, JAR_BOTTOM);
        innerGrad.addColorStop(0, 'rgba(224, 247, 250, 0.08)');
        innerGrad.addColorStop(0.5, 'rgba(178, 235, 242, 0.14)');
        innerGrad.addColorStop(1, 'rgba(128, 222, 234, 0.22)');
        ctx.fillStyle = innerGrad;
        ctx.fill();
        ctx.restore();
    }

    function drawJarBodyFront() {
        const jarW = JAR_RIGHT - JAR_LEFT;
        const jarH = JAR_BOTTOM - JAR_TOP;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(JAR_LEFT, JAR_TOP, jarW, jarH, [8, 8, 36, 36]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(JAR_LEFT + 8, JAR_TOP + 20);
        ctx.lineTo(JAR_LEFT + 8, JAR_BOTTOM - 40);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(JAR_RIGHT - 8, JAR_TOP + 40);
        ctx.lineTo(JAR_RIGHT - 8, JAR_BOTTOM - 60);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(WIDTH / 2, JAR_TOP, jarW / 2 + 4, 10, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#ffecb3';
        ctx.beginPath();
        ctx.roundRect(JAR_LEFT - 10, JAR_BOTTOM + 2, jarW + 20, 16, 4);
        ctx.fill();
        ctx.strokeStyle = '#d7ccc8';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    function drawDangerLine() {
        ctx.save();
        ctx.setLineDash([8, 6]);

        const pulse = isDangerActive ? 0.7 + Math.sin(performance.now() * 0.01) * 0.3 : 0.45;
        ctx.strokeStyle = isDangerActive ? `rgba(255, 50, 50, ${pulse})` : 'rgba(255, 215, 0, 0.6)';
        ctx.lineWidth = isDangerActive ? 3.5 : 2;

        ctx.beginPath();
        ctx.moveTo(JAR_LEFT + 10, DANGER_Y);
        ctx.lineTo(JAR_RIGHT - 10, DANGER_Y);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.fillStyle = isDangerActive ? '#ff5252' : '#ffe082';
        ctx.font = '700 12px "Rubik", "Nunito", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('КРАЙ БАНКИ', JAR_RIGHT - 15, DANGER_Y - 6);

        ctx.restore();
    }

    function getAimLandingY(curX, radius) {
        let targetY = JAR_BOTTOM - radius;
        for (let i = 0; i < fruits.length; i++) {
            const f = fruits[i];
            const dx = Math.abs(f.position.x - curX);
            const sumR = f.circleRadius + radius;
            if (dx < sumR) {
                const contactY = f.position.y - Math.sqrt(Math.max(0, sumR * sumR - dx * dx));
                if (contactY < targetY && contactY > DROP_Y) {
                    targetY = contactY;
                }
            }
        }
        return targetY;
    }

    function drawAimingGuide() {
        if (!canDrop || isGameOver || isScoopMode) return;

        const radius = FRUIT_DEFS[currentTier].radius;
        const curX = Math.min(Math.max(aimX, JAR_LEFT + radius + 2), JAR_RIGHT - radius - 2);
        const landingY = getAimLandingY(curX, radius);

        ctx.save();
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = 'rgba(255, 248, 210, 0.38)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(curX, DROP_Y + radius + 2);
        ctx.lineTo(curX, Math.max(DROP_Y + radius + 4, landingY - radius));
        ctx.stroke();

        // Тонкий призрачный силуэт точки приземления
        ctx.beginPath();
        ctx.arc(curX, landingY, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 248, 210, 0.09)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 248, 210, 0.28)';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.restore();
    }

    function drawCurrentDroppingFruit() {
        if (!canDrop || isGameOver) return;

        const radius = FRUIT_DEFS[currentTier].radius;
        const curX = Math.min(Math.max(aimX, JAR_LEFT + radius + 2), JAR_RIGHT - radius - 2);
        const bobbingY = DROP_Y + Math.sin(performance.now() * 0.005) * 3;

        const sprite = window.spriteRenderer.getSprite(currentTier);
        if (sprite) {
            ctx.save();
            if (isScoopMode) ctx.globalAlpha = 0.42;
            const drawSize = radius * 2.4;
            ctx.drawImage(
                sprite,
                curX - drawSize / 2,
                bobbingY - drawSize / 2,
                drawSize,
                drawSize
            );
            ctx.restore();
        }
    }

    // GAME JUICE: Отрисовка плодов (мировая тень ДО поворота + Squash & Stretch)
    function drawFruits() {
        for (let i = 0; i < fruits.length; i++) {
            const body = fruits[i];
            const tier = body.fruitTier;
            const def = FRUIT_DEFS[tier];
            const sprite = window.spriteRenderer.getSprite(tier);

            if (!sprite) continue;

            ctx.save();
            ctx.translate(body.position.x, body.position.y);

            // Мягкая тень в мировых координатах (никогда не переворачивается вверх ногами)
            ctx.beginPath();
            ctx.arc(0, 3, def.radius * 0.96, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(24, 10, 3, 0.22)';
            ctx.fill();

            if (isScoopMode) {
                const pulse = 0.65 + Math.sin(performance.now() * 0.01) * 0.25;
                ctx.save();
                ctx.setLineDash([5, 4]);
                ctx.strokeStyle = `rgba(255, 213, 79, ${pulse})`;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(0, 0, def.radius + 3, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            ctx.rotate(body.angle);

            // Применяем коэффициенты сплющивания и появления
            if (body.juice) {
                const s = body.juice.spawnScale;
                ctx.scale(body.juice.scaleX * s, body.juice.scaleY * s);
            }

            const drawSize = def.radius * 2.4;
            ctx.drawImage(
                sprite,
                -drawSize / 2,
                -drawSize / 2,
                drawSize,
                drawSize
            );

            ctx.restore();
        }
    }

    function updateBoosterUI() {
        if (scoopBtn && scoopBadge) {
            scoopBtn.classList.toggle('active', isScoopMode);
            scoopBtn.classList.toggle('ad-ready', scoopCharges <= 0 && !isScoopMode);
            scoopBadge.innerHTML = scoopCharges > 0 ? String(scoopCharges) : SVG_VIDEO_BADGE;
        }
        if (shakeBtn && shakeBadge) {
            shakeBtn.classList.toggle('ad-ready', shakeCharges <= 0);
            shakeBadge.innerHTML = shakeCharges > 0 ? String(shakeCharges) : SVG_VIDEO_BADGE;
        }
        if (scoopBannerEl) {
            scoopBannerEl.classList.toggle('hidden', !isScoopMode);
        }
        if (canvas) {
            canvas.classList.toggle('scoop-mode', isScoopMode);
        }
    }

    function findFruitAtPoint(x, y) {
        let best = null;
        let bestDist = Infinity;
        for (let i = 0; i < fruits.length; i++) {
            const f = fruits[i];
            const dist = Math.hypot(f.position.x - x, f.position.y - y);
            if (dist <= f.circleRadius + 16 && dist < bestDist) {
                best = f;
                bestDist = dist;
            }
        }
        return best;
    }

    function scoopFruit(targetBody) {
        if (!targetBody || isGameOver || isPaused) return false;
        const fx = targetBody.position.x;
        const fy = targetBody.position.y;
        const color = FRUIT_DEFS[targetBody.fruitTier]?.color || '#ffd54f';

        Matter.World.remove(world, targetBody);
        fruits = fruits.filter((f) => f !== targetBody);

        particleSys.spawnMergeBurst(fx, fy, color, 24, 5.2);
        scorePopups.add(fx, fy - 12, 'УБРАНО!', '#ffd54f', 22);
        screenShake.addTrauma(0.28);
        window.soundEffects.playScoop();

        scoopCharges = Math.max(0, scoopCharges - 1);
        isScoopMode = false;
        isAiming = false;

        dangerTime = Math.max(0, dangerTime - 1.2);
        if (dangerTime === 0) {
            isDangerActive = false;
            if (dangerBannerEl) dangerBannerEl.classList.add('hidden');
            if (dangerProgressEl) dangerProgressEl.style.width = '0%';
        }

        updateBoosterUI();
        return true;
    }

    function activateScoopMode() {
        if (isGameOver || isPaused) return;
        window.soundEffects.init();
        window.soundEffects.startAmbientMusic();

        if (isScoopMode) {
            isScoopMode = false;
            updateBoosterUI();
            window.soundEffects.playClick();
            return;
        }

        if (scoopCharges <= 0) {
            const grantScoop = () => {
                scoopCharges += 1;
                updateBoosterUI();
                window.soundEffects.playJarSuccess();
                scorePopups.add(WIDTH / 2, 118, '+1 ПОВАРЁШКА!', '#ffd54f', 22);
            };
            if (bridge) bridge.showRewardedAd(grantScoop);
            else grantScoop();
            return;
        }

        if (fruits.length === 0) {
            window.soundEffects.playClick();
            if (bridge) bridge.showToast('В банке пока нет плодов!', true);
            else scorePopups.add(WIDTH / 2, 220, 'Банка пуста!', '#ffe082', 20);
            return;
        }

        isScoopMode = true;
        isAiming = false;
        window.soundEffects.playClick();
        updateBoosterUI();
    }

    function shakeJar() {
        if (isGameOver || isPaused) return;
        window.soundEffects.init();
        window.soundEffects.startAmbientMusic();

        if (isScoopMode) {
            isScoopMode = false;
            updateBoosterUI();
        }

        if (shakeCharges <= 0) {
            const grantShake = () => {
                shakeCharges += 1;
                updateBoosterUI();
                window.soundEffects.playJarSuccess();
                scorePopups.add(WIDTH / 2, 118, '+1 ВСТРЯСКА!', '#ffd54f', 22);
            };
            if (bridge) bridge.showRewardedAd(grantShake);
            else grantShake();
            return;
        }

        if (fruits.length === 0) {
            window.soundEffects.playClick();
            if (bridge) bridge.showToast('В банке пока нет плодов!', true);
            else scorePopups.add(WIDTH / 2, 220, 'Банка пуста!', '#ffe082', 20);
            return;
        }

        shakeCharges = Math.max(0, shakeCharges - 1);
        updateBoosterUI();

        const now = performance.now();
        for (let i = 0; i < fruits.length; i++) {
            const b = fruits[i];
            const isNearTop = (b.position.y - b.circleRadius) < DANGER_Y + 28;
            const centerPush = b.position.x > WIDTH / 2 ? -1.4 : 1.4;
            const vx = (Math.random() - 0.5) * 8.2 + centerPush;
            const vy = isNearTop ? (0.8 + Math.random() * 1.4) : -(2.2 + Math.random() * 3.2);

            Matter.Body.setVelocity(b, { x: vx, y: vy });
            Matter.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.24);
            b.spawnTime = Math.max(b.spawnTime || 0, now - 400);
            if (b.juice) b.juice.triggerSquash(0.26);
        }

        screenShake.addTrauma(0.9);
        window.soundEffects.playJarShake();
        scorePopups.add(WIDTH / 2, 210, 'ТРЯСЁМ БАНКУ!', '#ffe082', 24);
        particleSys.spawnMergeBurst(WIDTH / 2, JAR_BOTTOM - 90, '#fff9c4', 20, 4.5);
    }

    function rescueHarvest() {
        if (rescueUsedThisRun) return false;
        const sorted = fruits.slice().sort((a, b) => (a.position.y - a.circleRadius) - (b.position.y - b.circleRadius));
        const removeCount = sorted.length > 0 ? Math.min(sorted.length, Math.max(1, Math.ceil(sorted.length * 0.35))) : 0;
        const toRemove = sorted.slice(0, removeCount);

        if (toRemove.length > 0) {
            Matter.World.remove(world, toRemove);
            const removeSet = new Set(toRemove);
            fruits = fruits.filter((f) => !removeSet.has(f));
            toRemove.forEach((b) => {
                const color = FRUIT_DEFS[b.fruitTier]?.color || '#ffe082';
                particleSys.spawnMergeBurst(b.position.x, b.position.y, color, 16, 4.6);
            });
        }

        const now = performance.now();
        for (let i = 0; i < fruits.length; i++) {
            fruits[i].spawnTime = now;
        }

        rescueUsedThisRun = true;
        dangerTime = 0;
        isDangerActive = false;
        isGameOver = false;
        isPaused = false;
        isScoopMode = false;
        isAiming = false;
        canDrop = true;

        if (dangerBannerEl) dangerBannerEl.classList.add('hidden');
        if (dangerProgressEl) dangerProgressEl.style.width = '0%';
        const modal = document.getElementById('gameOverModal');
        if (modal) modal.classList.add('hidden');

        updateBoosterUI();
        window.soundEffects.playJarSuccess();
        screenShake.addTrauma(0.38);
        scorePopups.add(WIDTH / 2, DANGER_Y + 34, `СПАСЕНО! -${removeCount}`, '#69f0ae', 24);
        return true;
    }

    // Управление
    function setupControls() {
        function getCanvasPoint(evt) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = WIDTH / rect.width;
            const scaleY = HEIGHT / rect.height;
            return {
                x: (evt.clientX - rect.left) * scaleX,
                y: (evt.clientY - rect.top) * scaleY
            };
        }

        function onPointerMove(e) {
            if (isGameOver || isPaused || isScoopMode) return;
            aimX = getCanvasPoint(e).x;
        }

        function onPointerDown(e) {
            if (isGameOver || isPaused) return;
            window.soundEffects.init();
            window.soundEffects.startAmbientMusic();

            const pt = getCanvasPoint(e);

            if (isScoopMode) {
                isAiming = false;
                const hit = findFruitAtPoint(pt.x, pt.y);
                if (hit) {
                    scoopFruit(hit);
                } else {
                    window.soundEffects.playClick();
                    scorePopups.add(
                        Math.min(Math.max(pt.x, 70), WIDTH - 70),
                        Math.min(Math.max(pt.y, 160), HEIGHT - 60),
                        'Нажмите на плод',
                        '#ffe082',
                        16
                    );
                }
                return;
            }

            try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
            isAiming = true;
            aimX = pt.x;
        }

        function onPointerUp(e) {
            try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
            if (isScoopMode) {
                isAiming = false;
                return;
            }
            if (!isAiming) return;
            isAiming = false;
            if (isGameOver || isPaused) return;
            dropFruit();
        }

        canvas.addEventListener('pointermove', onPointerMove, { passive: true });
        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointercancel', () => { isAiming = false; });

        if (scoopBtn) {
            scoopBtn.addEventListener('click', (e) => {
                e.preventDefault();
                activateScoopMode();
            });
        }

        if (scoopCancelBtn) {
            scoopCancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                isScoopMode = false;
                window.soundEffects.playClick();
                updateBoosterUI();
            });
        }

        if (shakeBtn) {
            shakeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                shakeJar();
            });
        }

        if (dropBtn) {
            dropBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (isScoopMode) {
                    isScoopMode = false;
                    updateBoosterUI();
                }
                window.soundEffects.playClick();
                dropFruit();
            });
        }

        if (musicBtn) {
            musicBtn.addEventListener('click', () => {
                window.soundEffects.toggleMusic();
                syncAudioButtons();
            });
        }

        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                window.soundEffects.toggleMute();
                syncAudioButtons();
            });
        }

        const restartTopBtn = document.getElementById('restartBtn');
        if (restartTopBtn) {
            restartTopBtn.addEventListener('click', () => {
                if (bridge && bridge.isAdShowing) return;
                if (bridge) bridge.showInterstitialAd(() => restartGame());
                else restartGame();
            });
        }

        const ladderBtn = document.getElementById('ladderBtn');
        if (ladderBtn) {
            ladderBtn.addEventListener('click', showLadderModal);
        }

        const bragBtn = document.getElementById('bragBtn');
        if (bragBtn) {
            bragBtn.addEventListener('click', showShareModal);
        }

        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                window.soundEffects.playClick();
                const modal = e.target.closest('.modal-overlay');
                if (modal) modal.classList.add('hidden');
                if (!isGameOver) isPaused = false;
            });
        });

        ['ladderModal', 'shareModal'].forEach(id => {
            const m = document.getElementById(id);
            if (m) {
                m.addEventListener('click', (e) => {
                    if (e.target === m) {
                        window.soundEffects.playClick();
                        m.classList.add('hidden');
                        if (!isGameOver) isPaused = false;
                    }
                });
            }
        });

        const copyShareBtn = document.getElementById('copyShareBtn');
        if (copyShareBtn) {
            copyShareBtn.addEventListener('click', copyShareText);
        }

        if (rescueBtn) {
            rescueBtn.addEventListener('click', () => {
                if (rescueUsedThisRun) return;
                if (bridge) {
                    bridge.showRewardedAd(() => rescueHarvest());
                } else {
                    rescueHarvest();
                }
            });
        }

        const gameOverRestartBtn = document.getElementById('gameOverRestartBtn');
        if (gameOverRestartBtn) {
            gameOverRestartBtn.addEventListener('click', () => {
                if (bridge && bridge.isAdShowing) return;
                const finishRestart = () => {
                    document.getElementById('gameOverModal').classList.add('hidden');
                    restartGame();
                };
                if (bridge) bridge.showInterstitialAd(finishRestart);
                else finishRestart();
            });
        }
    }

    const SVG_MUSIC_ON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
    const SVG_MUSIC_OFF = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><line x1="2" y1="2" x2="22" y2="22"/></svg>';
    const SVG_SOUND_ON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
    const SVG_SOUND_OFF = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';

    function syncAudioButtons() {
        if (musicBtn) {
            const musicMuted = window.soundEffects.isMusicMuted();
            const wrap = document.getElementById('musicIconWrap');
            if (wrap) wrap.innerHTML = musicMuted ? SVG_MUSIC_OFF : SVG_MUSIC_ON;
            musicBtn.classList.toggle('muted', musicMuted);
        }
        if (soundBtn) {
            const sfxMuted = window.soundEffects.isMuted();
            const wrap = document.getElementById('soundIconWrap');
            if (wrap) wrap.innerHTML = sfxMuted ? SVG_SOUND_OFF : SVG_SOUND_ON;
            soundBtn.classList.toggle('muted', sfxMuted);
        }
    }

    function triggerGameOver() {
        isGameOver = true;
        isScoopMode = false;
        isAiming = false;
        updateBoosterUI();
        window.soundEffects.playGameOver();

        if (rescueBtn) {
            const canRescue = !rescueUsedThisRun && fruits.length > 0;
            rescueBtn.classList.toggle('hidden', !canRescue);
        }

        const modal = document.getElementById('gameOverModal');
        if (modal) {
            document.getElementById('finalScoreVal').textContent = score;
            document.getElementById('finalBestVal').textContent = highScore;
            modal.classList.remove('hidden');
        }
    }

    function restartGame() {
        window.soundEffects.playClick();

        for (let i = 0; i < fruits.length; i++) {
            Matter.World.remove(world, fruits[i]);
        }
        fruits = [];

        score = 0;
        scoopCharges = 1;
        shakeCharges = 1;
        isScoopMode = false;
        rescueUsedThisRun = false;
        updateScoreDisplays();
        updateBoosterUI();

        dangerTime = 0;
        isDangerActive = false;
        isGameOver = false;
        isPaused = false;
        isAiming = false;
        canDrop = true;

        if (dangerBannerEl) dangerBannerEl.classList.add('hidden');
        if (dangerProgressEl) dangerProgressEl.style.width = '0%';

        pickNextFruits();
    }

    function showLadderModal() {
        window.soundEffects.playClick();
        const modal = document.getElementById('ladderModal');
        if (!modal) return;
        isPaused = true;

        const listContainer = document.getElementById('ladderList');
        if (listContainer && listContainer.children.length === 0) {
            FRUIT_DEFS.forEach((def, idx) => {
                const item = document.createElement('div');
                item.className = 'ladder-item';

                const canvasPreview = document.createElement('canvas');
                canvasPreview.width = 54;
                canvasPreview.height = 54;
                const pCtx = canvasPreview.getContext('2d');
                const sprite = window.spriteRenderer.getSprite(def.id);
                if (sprite) {
                    pCtx.drawImage(sprite, 2, 2, 50, 50);
                }

                item.innerHTML = `
                    <div class="ladder-icon"></div>
                    <div class="ladder-info">
                        <div class="ladder-name">${idx + 1}. ${def.name}</div>
                        <div class="ladder-desc">+${def.score} очков</div>
                    </div>
                    ${idx < FRUIT_DEFS.length - 1 ? '<div class="ladder-arrow" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></div>' : '<div class="ladder-badge">ДЖЕКПОТ</div>'}
                `;
                item.querySelector('.ladder-icon').appendChild(canvasPreview);
                listContainer.appendChild(item);
            });
        }

        modal.classList.remove('hidden');
    }

    function showShareModal() {
        window.soundEffects.playClick();
        const modal = document.getElementById('shareModal');
        if (!modal) return;
        isPaused = true;

        const shareTextarea = document.getElementById('shareText');
        if (shareTextarea) {
            shareTextarea.value = `Дачный Погребок: Закатки на зиму!\nМой урожай составил ${score} очков — хватит на всю зиму!\nСможешь закатать больше банок? Сыграй прямо сейчас!`;
        }

        modal.classList.remove('hidden');
    }

    async function copyShareText() {
        window.soundEffects.playClick();
        const shareTextarea = document.getElementById('shareText');
        if (!shareTextarea) return;

        if (bridge && bridge.isSocialEnv && typeof bridge.sharePost === 'function') {
            const posted = await bridge.sharePost(shareTextarea.value);
            if (posted) {
                bridge.showToast('Запись опубликована!');
                return;
            }
        }

        shareTextarea.select();
        shareTextarea.setSelectionRange(0, 99999);

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareTextarea.value).then(showToast).catch(() => {
                try { document.execCommand('copy'); } catch (_) {}
                showToast();
            });
        } else {
            try { document.execCommand('copy'); } catch (_) {}
            showToast();
        }
    }

    function showToast() {
        const toast = document.getElementById('copyToast');
        if (toast) {
            toast.classList.remove('hidden');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 2500);
        }
    }

    window.dachaGame = {
        init,
        restartGame,
        dropFruit,
        shakeJar,
        activateScoopMode,
        triggerGameOver,
        spawnTestFruit: (x, y, tier) => {
            const body = createFruitBody(x, y, tier, { spawnScale: 1.0 });
            Matter.World.add(world, body);
            fruits.push(body);
            return body;
        },
        getState: () => ({
            score,
            highScore,
            scoopCharges,
            shakeCharges,
            isScoopMode,
            rescueUsedThisRun,
            isGameOver,
            fruitCount: fruits.length,
            dangerTime
        })
    };

    window.addEventListener('DOMContentLoaded', init);
})();
