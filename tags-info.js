// tags-info.js - Модальное окно с расшифровкой тегов
// Полностью адаптивный дизайн для компьютера и телефона

(function() {
    'use strict';

    // === HTML-шаблон модального окна ===
    const modalHTML = `
    <div class="tags-modal-overlay" id="tagsModal">
        <div class="tags-modal-content">
            <button class="tags-modal-close" id="closeTagsModal" aria-label="Закрыть">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            
            <div class="tags-modal-header">
                <div class="tags-modal-icon">📜</div>
                <h2 class="tags-modal-title">Расшифровка тегов и эпох</h2>
                <p class="tags-modal-subtitle">Подробное описание всех исторических эпох и тегов, используемых в базе</p>
            </div>
            
            <div class="tags-modal-body">
                <ul class="tags-list">
                    <li class="tags-item">
                        <div class="tag-name">Века</div>
                        <div class="tag-description">Временные периоды истории определённых регионов. Обычно охватывают конкретный век или несколько веков (например, "XIII век", "XIV-XV века").</div>
                    </li>
                    <li class="tags-item">
                        <div class="tag-name">Мультивек</div>
                        <div class="tag-description">Временной период охватывает реконструкцию большей части возможных исторических эпох Европы и сопредельных регионов. Такие клубы обычно не специализируются на конкретном периоде, а занимаются реконструкцией различных исторических периодов.</div>
                    </li>
                    <li class="tags-item">
                        <div class="tag-name">Древний Египет</div>
                        <div class="tag-description">Период в исторической реконструкции, специализирующийся на истории, культуре и военном деле Древнего Египта. Охватывает времена фараонов, от Раннего царства (ок. 3000 г. до н.э.) до эллинистического периода.</div>
                    </li>
                    <li class="tags-item">
                        <div class="tag-name">Древний Рим</div>
                        <div class="tag-description">Период в исторической реконструкции, специализирующийся на истории, легионах, быте и культуре Древнего Рима. Включает период Римской республики и Римской империи (примерно с 753 г. до н.э. по 476 г. н.э.).</div>
                    </li>
                    <li class="tags-item">
                        <div class="tag-name">Средневековье</div>
                        <div class="tag-description">Период в исторической реконструкции, специализирующийся на отрезке европейской истории с V по XV век, включая раннее, высокое и позднее средневековье. Охватывает викингов, рыцарство, замки, крестовые походы и другие аспекты средневековой жизни.</div>
                    </li>
                    <li class="tags-item">
                        <div class="tag-name">Эпоха Петра I</div>
                        <div class="tag-description">Период в исторической реконструкции, специализирующийся на реконструкции рубежа XVII–XVIII веков, в первую очередь армии и быта периода правления Петра I. Включает Северную войну, реформы армии и создание Российской империи.</div>
                    </li>
                    <li class="tags-item">
                        <div class="tag-name">ПМВ (Первая мировая война)</div>
                        <div class="tag-description">Период в исторической реконструкции, специализирующийся на истории, униформе и сражениях Первой мировой войны (1914–1918 гг.). Включает армии всех стран-участниц, окопную войну, технику и вооружение периода Великой войны.</div>
                    </li>
                    <li class="tags-item">
                        <div class="tag-name">Гражданская война</div>
                        <div class="tag-description">Период в исторической реконструкции, специализирующийся на истории, униформе и сражениях Гражданской войны (1917—1922 гг.). Охватывает Красную армию, Белое движение и гражданскую жизнь.</div>
                    </li>
                    <li class="tags-item">
                        <div class="tag-name">ВОВ (Великая Отечественная война)</div>
                        <div class="tag-description">Период в исторической реконструкции, специализирующийся на истории, униформе и сражениях Великой Отечественной войны (1941–1945 гг.). Охватывает Красную армию, Вермахт, союзников, партизанское движение и тыловую жизнь.</div>
                    </li>
                    <li class="tags-item">
                        <div class="tag-name">Афганская война</div>
                        <div class="tag-description">Период в исторической реконструкции, специализирующийся на истории, униформе и сражениях Афганской войны (1979—1989 гг.).</div>
                    </li>
                    <li class="tags-item">
                        <div class="tag-name">Япония</div>
                        <div class="tag-description">Направление в исторической реконструкции, специализирующееся на истории и культуре Японского архипелага в различные исторические периоды.</div>
                    </li>
                    <li class="tags-item">
                        <div class="tag-name">СМБ (Современный Мечевой Бой)</div>
                        <div class="tag-description">Современный Мечевой Бой – полноконтактный вид спортивного единоборства, поединок или групповой бой спортсменов с применением безопасных имитаторов средневекового клинкового оружия — «спортивного меча» и «спортивного щита», изготовленных из мягких полимерных материалов.</div>
                    </li>
                    <li class="tags-item">
                        <div class="tag-name">БИФ (Безопасное Историческое Фехтование)</div>
                        <div class="tag-description">Безопасное Историческое Фехтование — полноконтактный вид спортивного единоборства, поединок или групповой бой спортсменов с применением безопасных имитаторов средневекового оружия, изготовленных из мягких полимерных материалов.</div>
                    </li>
                    <li class="tags-item">
                        <div class="tag-name">ИСБ (Исторический Средневековый Бой)</div>
                        <div class="tag-description">Исторический Средневековый Бой — современный вид спорта, включающий полноконтактные сражения с использованием защитного и наступательного вооружения, характерного для средних веков. Отличается использованием металлического оружия и доспехов.</div>
                    </li>
                    <li class="tags-item">
                        <div class="tag-name">HEMA (Historical European Martial Arts)</div>
                        <div class="tag-description">Направление, изучающее и практикующее исторические европейские боевые искусства на основе старинных манускриптов и трактатов (XIII — нач. XX вв.). Включает фехтование на различном оружии (длинный меч, рапира, сабля и др.), а также приёмы рукопашного боя и борьбы.</div>
                    </li>
                </ul>
            </div>
            
            <div class="tags-modal-footer">
                <span class="tags-modal-decoration">✦ ✦ ✦</span>
            </div>
        </div>
    </div>
    `;

    // === Стили модального окна ===
    const modalStyles = `
    <style id="tags-modal-styles">
        /* ========================================
                   ОБЩИЙ КОНТЕЙНЕР
                ======================================== */
        .tags-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(20, 15, 10, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.4s ease, visibility 0.4s ease;
            padding: 20px;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        }
        
        .tags-modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        
        /* ========================================
                   КОНТЕНТ
                ======================================== */
        .tags-modal-content {
            background: linear-gradient(160deg, #fef9f3 0%, #f5ebd8 100%);
            border-radius: 28px;
            padding: 40px 48px 35px;
            width: 100%;
            max-width: 820px;
            max-height: 85vh;
            overflow-y: auto;
            border: 2px solid rgba(212, 165, 116, 0.5);
            box-shadow: 
                0 30px 80px rgba(0, 0, 0, 0.5),
                0 0 0 1px rgba(212, 165, 116, 0.2) inset,
                0 1px 0 rgba(255, 255, 255, 0.6) inset;
            position: relative;
            animation: tagsModalAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            scroll-behavior: smooth;
            touch-action: pan-y;
        }
        
        /* Декоративная линия сверху */
        .tags-modal-content::before {
            content: '';
            position: absolute;
            top: 0;
            left: 40px;
            right: 40px;
            height: 3px;
            background: linear-gradient(90deg, transparent, #d4a574, #e6a336, #d4a574, transparent);
            border-radius: 0 0 3px 3px;
        }
        
        @keyframes tagsModalAppear {
            from {
                opacity: 0;
                transform: translateY(-40px) scale(0.92);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        /* ========================================
                   СКРОЛЛБАР
                ======================================== */
        .tags-modal-content::-webkit-scrollbar {
            width: 6px;
        }
        .tags-modal-content::-webkit-scrollbar-track {
            background: rgba(212, 165, 116, 0.1);
            border-radius: 10px;
            margin: 10px 0;
        }
        .tags-modal-content::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #d4a574, #c4905a);
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .tags-modal-content::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #c4905a, #b07a4a);
        }
        
        /* ========================================
                   КНОПКА ЗАКРЫТИЯ
                ======================================== */
        .tags-modal-close {
            position: sticky;
            float: right;
            top: 0;
            background: rgba(255, 248, 240, 0.85);
            border: 1px solid rgba(212, 165, 116, 0.3);
            border-radius: 50%;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            color: #8b4513;
            flex-shrink: 0;
            margin-top: -8px;
            margin-right: -8px;
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            z-index: 5;
            touch-action: manipulation;
        }
        
        .tags-modal-close:hover {
            background: rgba(139, 69, 19, 0.12);
            border-color: #8b4513;
            transform: rotate(90deg) scale(1.05);
            box-shadow: 0 4px 16px rgba(139, 69, 19, 0.15);
        }
        
        .tags-modal-close:active {
            transform: rotate(90deg) scale(0.95);
        }
        
        .tags-modal-close svg {
            width: 22px;
            height: 22px;
            stroke-width: 2.5;
        }
        
        /* ========================================
                   ЗАГОЛОВОК
                ======================================== */
        .tags-modal-header {
            text-align: center;
            margin-bottom: 28px;
            padding-bottom: 22px;
            border-bottom: 2px solid rgba(212, 165, 116, 0.3);
            clear: both;
            position: relative;
        }
        
        .tags-modal-icon {
            font-size: 2.8rem;
            display: block;
            margin-bottom: 10px;
            animation: tagsIconFloat 3s ease-in-out infinite;
        }
        
        @keyframes tagsIconFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
        }
        
        .tags-modal-title {
            font-family: 'Cinzel', 'Georgia', serif;
            font-size: 2.2rem;
            color: #2c1810;
            margin-bottom: 6px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
        }
        
        .tags-modal-subtitle {
            color: #6a5a4a;
            font-size: 1.05rem;
            max-width: 580px;
            margin: 0 auto;
            line-height: 1.6;
            font-weight: 400;
        }
        
        /* ========================================
                   ТЕЛО СО СПИСКОМ
                ======================================== */
        .tags-modal-body {
            padding: 5px 0;
        }
        
        .tags-list {
            list-style-type: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .tags-item {
            padding: 18px 22px;
            border-radius: 14px;
            background: rgba(255, 252, 248, 0.5);
            border: 1px solid rgba(212, 165, 116, 0.12);
            transition: all 0.25s ease;
            margin-bottom: 6px;
            cursor: default;
        }
        
        .tags-item:hover {
            background: rgba(255, 252, 248, 0.9);
            border-color: rgba(212, 165, 116, 0.3);
            box-shadow: 0 4px 16px rgba(139, 69, 19, 0.06);
            transform: translateX(4px);
        }
        
        .tags-item:last-child {
            margin-bottom: 0;
        }
        
        .tag-name {
            font-weight: 700;
            color: #6b3a1a;
            margin-bottom: 4px;
            font-size: 1.1rem;
            font-family: 'Cinzel', 'Georgia', serif;
            letter-spacing: 0.3px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .tag-name::before {
            content: '◆';
            color: #d4a574;
            font-size: 0.7rem;
            opacity: 0.7;
        }
        
        .tag-description {
            color: #4a3f35;
            font-size: 0.95rem;
            line-height: 1.65;
            padding-left: 28px;
            font-weight: 400;
        }
        
        /* ========================================
                   ФУТЕР
                ======================================== */
        .tags-modal-footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px solid rgba(212, 165, 116, 0.2);
        }
        
        .tags-modal-decoration {
            color: #d4a574;
            font-size: 0.8rem;
            letter-spacing: 8px;
            opacity: 0.4;
        }
        
        /* ========================================
                   АДАПТИВНОСТЬ — ПЛАНШЕТЫ
                ======================================== */
        @media (max-width: 992px) {
            .tags-modal-content {
                padding: 32px 32px 30px;
                max-width: 720px;
                border-radius: 24px;
            }
            
            .tags-modal-title {
                font-size: 1.9rem;
            }
            
            .tags-modal-content::before {
                left: 32px;
                right: 32px;
            }
        }
        
        /* ========================================
                   АДАПТИВНОСТЬ — ТЕЛЕФОНЫ (до 768px)
                ======================================== */
        @media (max-width: 768px) {
            .tags-modal-overlay {
                padding: 12px;
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                align-items: flex-end;
                /* клик по фону НЕ закрывает окно на телефоне */
                pointer-events: none;
            }
            
            .tags-modal-overlay.active {
                pointer-events: auto;
            }
            
            .tags-modal-content {
                padding: 24px 20px 25px;
                max-width: 100%;
                max-height: 88vh;
                border-radius: 20px 20px 16px 16px;
                animation: tagsModalAppearMobile 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
                /* блокируем передачу событий на оверлей */
                pointer-events: auto;
                touch-action: pan-y;
            }
            
            @keyframes tagsModalAppearMobile {
                from {
                    opacity: 0;
                    transform: translateY(40px) scale(0.96);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .tags-modal-content::before {
                left: 20px;
                right: 20px;
                height: 2px;
            }
            
            .tags-modal-title {
                font-size: 1.6rem;
            }
            
            .tags-modal-subtitle {
                font-size: 0.92rem;
                padding: 0 4px;
            }
            
            .tags-modal-icon {
                font-size: 2.2rem;
                margin-bottom: 6px;
            }
            
            .tags-modal-close {
                width: 40px;
                height: 40px;
                margin-top: -4px;
                margin-right: -4px;
            }
            
            .tags-modal-close svg {
                width: 18px;
                height: 18px;
            }
            
            .tag-name {
                font-size: 1rem;
            }
            
            .tag-description {
                font-size: 0.88rem;
                padding-left: 22px;
                line-height: 1.6;
            }
            
            .tags-item {
                padding: 14px 16px;
                border-radius: 10px;
                margin-bottom: 4px;
            }
            
            .tags-item:hover {
                transform: translateX(2px);
            }
            
            .tags-modal-footer {
                margin-top: 14px;
                padding-top: 12px;
            }
            
            .tags-modal-decoration {
                font-size: 0.7rem;
                letter-spacing: 6px;
            }
        }
        
        /* ========================================
                   АДАПТИВНОСТЬ — МАЛЕНЬКИЕ ТЕЛЕФОНЫ (до 480px)
                ======================================== */
        @media (max-width: 480px) {
            .tags-modal-overlay {
                padding: 8px;
            }
            
            .tags-modal-content {
                padding: 18px 14px 20px;
                max-height: 90vh;
                border-radius: 16px 16px 12px 12px;
            }
            
            .tags-modal-content::before {
                left: 14px;
                right: 14px;
                height: 2px;
            }
            
            .tags-modal-title {
                font-size: 1.3rem;
                letter-spacing: 0.3px;
            }
            
            .tags-modal-subtitle {
                font-size: 0.82rem;
                line-height: 1.5;
            }
            
            .tags-modal-icon {
                font-size: 1.8rem;
                margin-bottom: 4px;
            }
            
            .tags-modal-close {
                width: 34px;
                height: 34px;
                margin-top: -2px;
                margin-right: -2px;
            }
            
            .tags-modal-close svg {
                width: 16px;
                height: 16px;
            }
            
            .tag-name {
                font-size: 0.92rem;
            }
            
            .tag-name::before {
                font-size: 0.6rem;
            }
            
            .tag-description {
                font-size: 0.82rem;
                padding-left: 18px;
                line-height: 1.55;
            }
            
            .tags-item {
                padding: 12px 12px;
                border-radius: 8px;
                margin-bottom: 3px;
            }
            
            .tags-item:hover {
                transform: translateX(1px);
            }
            
            .tags-modal-footer {
                margin-top: 10px;
                padding-top: 10px;
            }
            
            .tags-modal-decoration {
                font-size: 0.6rem;
                letter-spacing: 4px;
            }
        }
        
        /* ========================================
                   АДАПТИВНОСТЬ — ОЧЕНЬ МАЛЕНЬКИЕ ЭКРАНЫ (до 360px)
                ======================================== */
        @media (max-width: 360px) {
            .tags-modal-content {
                padding: 14px 10px 16px;
                max-height: 92vh;
                border-radius: 12px 12px 10px 10px;
            }
            
            .tags-modal-title {
                font-size: 1.1rem;
            }
            
            .tags-modal-subtitle {
                font-size: 0.75rem;
            }
            
            .tags-modal-icon {
                font-size: 1.5rem;
            }
            
            .tags-modal-close {
                width: 30px;
                height: 30px;
                margin-top: -1px;
                margin-right: -1px;
            }
            
            .tags-modal-close svg {
                width: 14px;
                height: 14px;
            }
            
            .tag-name {
                font-size: 0.85rem;
            }
            
            .tag-description {
                font-size: 0.78rem;
                padding-left: 14px;
            }
            
            .tags-item {
                padding: 10px 10px;
                border-radius: 6px;
            }
        }
        
        /* ========================================
                   АНИМАЦИЯ ДЛЯ ПОЯВЛЕНИЯ НА ТЕЛЕФОНЕ
                ======================================== */
        @media (max-width: 768px) and (prefers-reduced-motion: reduce) {
            .tags-modal-content {
                animation: none;
            }
        }
    </style>
    `;

    // === Основная функция инициализации ===
    function initTagsModal() {
        const tagsInfoButton = document.getElementById('tagsInfoButton');
        const tagsModal = document.getElementById('tagsModal');
        const closeTagsModal = document.getElementById('closeTagsModal');

        if (!tagsInfoButton) {
            console.warn('Кнопка "Расшифровка тегов" не найдена на странице');
            return;
        }

        if (!tagsModal) {
            console.error('Модальное окно для расшифровки тегов не найдено на странице');
            return;
        }

        // Открытие
        const openModal = function(e) {
            e.preventDefault();
            tagsModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        tagsInfoButton.addEventListener('click', openModal);

        // Закрытие
        const closeModal = function() {
            tagsModal.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (closeTagsModal) {
            closeTagsModal.addEventListener('click', closeModal);
        }

        // ============================================
        // ЗАКРЫТИЕ ПО КЛИКУ НА ФОН — ТОЛЬКО НА КОМПЬЮТЕРЕ
        // На телефоне это отключено, чтобы не закрывалось случайно
        // ============================================
        let isMobile = false;
        const checkMobile = function() {
            isMobile = window.innerWidth <= 768;
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        tagsModal.addEventListener('click', function(e) {
            // Закрываем только если:
            // 1. Кликнули именно по фону (e.target === tagsModal)
            // 2. Это НЕ мобильное устройство (ширина > 768px)
            // 3. Окно активно
            if (e.target === tagsModal && !isMobile && tagsModal.classList.contains('active')) {
                closeModal();
            }
        });

        // Закрытие по ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && tagsModal.classList.contains('active')) {
                closeModal();
            }
        });

        console.log('✅ Модальное окно "Расшифровка тегов" инициализировано');
        console.log('📱 На телефоне: закрытие только по кнопке ✕');
    }

    // === Функция загрузки модального окна ===
    function loadTagsModal() {
        if (document.getElementById('tagsModal')) {
            console.log('Модальное окно тегов уже загружено на странице');
            initTagsModal();
            return;
        }

        if (!document.getElementById('tags-modal-styles')) {
            document.head.insertAdjacentHTML('beforeend', modalStyles);
        }

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        setTimeout(initTagsModal, 50);
    }

    // === Функция проверки и создания кнопки ===
    function ensureTagsButton() {
        if (document.getElementById('tagsInfoButton')) {
            return;
        }

        const filtersContainer = document.querySelector('.filters');
        if (!filtersContainer) {
            console.warn('Контейнер .filters не найден, кнопка не будет создана');
            return;
        }

        const buttonHTML = `
            <button class="tags-info-button" id="tagsInfoButton">
                <span>📖</span>
                <span>Расшифровка тегов</span>
            </button>
        `;

        const resetButton = document.querySelector('.reset-button');
        if (resetButton) {
            resetButton.insertAdjacentHTML('beforebegin', buttonHTML);
        } else {
            filtersContainer.insertAdjacentHTML('beforeend', buttonHTML);
        }

        console.log('Кнопка "Расшифровка тегов" создана автоматически');
    }

    // === Автозагрузка при DOMContentLoaded ===
    document.addEventListener('DOMContentLoaded', function() {
        ensureTagsButton();
        loadTagsModal();
    });

    // === Экспорт для использования в других файлах ===
    window.tagsModal = {
        load: loadTagsModal,
        init: initTagsModal,
        ensureButton: ensureTagsButton
    };

})();
