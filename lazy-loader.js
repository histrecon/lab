// ================================================================
// lazy-loader.js — Ленивая загрузка карточек
// Версия 1.0
// ================================================================

(function() {
    'use strict';

    /**
     * Класс LazyLoader — управляет ленивой загрузкой элементов
     */
    class LazyLoader {
        /**
         * @param {Object} options
         * @param {number} options.rootMargin - Отступ для предзагрузки (по умолчанию 200px)
         * @param {number} options.threshold - Порог видимости (по умолчанию 0.1)
         * @param {number} options.batchSize - Сколько элементов загружать за раз (по умолчанию 10)
         */
        constructor(options = {}) {
            this.rootMargin = options.rootMargin || '200px';
            this.threshold = options.threshold || 0.1;
            this.batchSize = options.batchSize || 10;
            this.observer = null;
            this.loadedItems = new Set();
            this.items = [];
            this.container = null;
            this.renderCallback = null;
            this.isLoading = false;
            this.allLoaded = false;
        }

        /**
         * Инициализация ленивой загрузки
         * @param {HTMLElement} container - Контейнер для карточек
         * @param {Array} items - Массив данных
         * @param {Function} renderCallback - Функция рендеринга одной карточки
         */
        init(container, items, renderCallback) {
            this.container = container;
            this.items = items;
            this.renderCallback = renderCallback;
            this.loadedItems.clear();
            this.allLoaded = false;

            // Показываем скелетоны
            this.showSkeletons(container, items.length);

            // Создаём наблюдатель
            if ('IntersectionObserver' in window) {
                this.observer = new IntersectionObserver(
                    (entries) => this.handleIntersection(entries),
                    {
                        rootMargin: this.rootMargin,
                        threshold: this.threshold
                    }
                );

                // Начинаем наблюдение за скелетонами
                this.observeSkeletons();
            } else {
                // Для старых браузеров — загружаем всё сразу
                this.loadAll();
            }
        }

        /**
         * Показать скелетоны (заглушки)
         */
        showSkeletons(container, count) {
            container.innerHTML = '';
            const fragment = document.createDocumentFragment();

            for (let i = 0; i < Math.min(count, this.batchSize); i++) {
                const skeleton = this.createSkeleton(i);
                fragment.appendChild(skeleton);
            }

            container.appendChild(fragment);
        }

        /**
         * Создать скелетон
         */
        createSkeleton(index) {
            const skeleton = document.createElement('div');
            skeleton.className = 'card-skeleton';
            skeleton.dataset.index = index;
            skeleton.innerHTML = `
                <div class="skeleton-header">
                    <div class="skeleton-line skeleton-title"></div>
                    <div class="skeleton-line skeleton-subtitle"></div>
                </div>
                <div class="skeleton-body">
                    <div class="skeleton-line skeleton-tag"></div>
                    <div class="skeleton-line skeleton-tag"></div>
                    <div class="skeleton-line skeleton-tag"></div>
                    <div class="skeleton-line skeleton-text"></div>
                    <div class="skeleton-line skeleton-text short"></div>
                </div>
                <div class="skeleton-footer">
                    <div class="skeleton-line skeleton-button"></div>
                    <div class="skeleton-line skeleton-id"></div>
                </div>
            `;
            return skeleton;
        }

        /**
         * Начать наблюдение за скелетонами
         */
        observeSkeletons() {
            const skeletons = this.container.querySelectorAll('.card-skeleton');
            skeletons.forEach(skeleton => {
                this.observer.observe(skeleton);
            });
        }

        /**
         * Обработка пересечений
         */
        handleIntersection(entries) {
            const skeletonsToLoad = [];

            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const skeleton = entry.target;
                    const index = parseInt(skeleton.dataset.index);
                    if (!this.loadedItems.has(index)) {
                        skeletonsToLoad.push({ skeleton, index });
                    }
                }
            });

            if (skeletonsToLoad.length > 0) {
                // Сортируем по индексу
                skeletonsToLoad.sort((a, b) => a.index - b.index);

                // Загружаем порциями
                const batch = skeletonsToLoad.slice(0, this.batchSize);
                this.loadBatch(batch);
            }
        }

        /**
         * Загрузить партию элементов
         */
        loadBatch(batch) {
            if (this.isLoading || batch.length === 0) return;
            this.isLoading = true;

            // Используем requestAnimationFrame для плавности
            requestAnimationFrame(() => {
                batch.forEach(({ skeleton, index }) => {
                    if (!this.loadedItems.has(index) && index < this.items.length) {
                        this.loadItem(skeleton, index);
                    }
                });

                this.isLoading = false;

                // Проверяем, все ли загружены
                if (this.loadedItems.size >= this.items.length) {
                    this.allLoaded = true;
                    if (this.observer) {
                        this.observer.disconnect();
                        this.observer = null;
                    }
                } else {
                    // Продолжаем наблюдение за оставшимися скелетонами
                    this.observeSkeletons();
                }
            });
        }

        /**
         * Загрузить один элемент
         */
        loadItem(skeleton, index) {
            try {
                const item = this.items[index];
                if (!item) return;

                const card = this.renderCallback(item, index);
                card.dataset.index = index;
                skeleton.replaceWith(card);
                this.loadedItems.add(index);

                // Анимация появления
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                requestAnimationFrame(() => {
                    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });

            } catch (error) {
                console.error('Ошибка загрузки элемента:', error);
                // Показываем сообщение об ошибке
                skeleton.innerHTML = `
                    <div style="padding: 20px; text-align: center; color: #c33;">
                        ⚠️ Ошибка загрузки
                    </div>
                `;
            }
        }

        /**
         * Загрузить все элементы сразу (для старых браузеров)
         */
        loadAll() {
            const skeletons = this.container.querySelectorAll('.card-skeleton');
            skeletons.forEach((skeleton, index) => {
                if (index < this.items.length) {
                    this.loadItem(skeleton, index);
                }
            });
        }

        /**
         * Обновить данные (при фильтрации)
         */
        updateItems(newItems) {
            // Очищаем состояние
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
            this.loadedItems.clear();
            this.items = newItems;
            this.allLoaded = false;

            // Перерисовываем
            this.showSkeletons(this.container, newItems.length);
            this.observeSkeletons();
        }

        /**
         * Принудительно загрузить все оставшиеся элементы
         */
        forceLoadAll() {
            const skeletons = this.container.querySelectorAll('.card-skeleton');
            skeletons.forEach((skeleton, index) => {
                if (!this.loadedItems.has(index) && index < this.items.length) {
                    this.loadItem(skeleton, index);
                }
            });
        }

        /**
         * Очистка
         */
        destroy() {
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
            this.loadedItems.clear();
            this.items = [];
            this.allLoaded = true;
        }
    }

    // ================================================================
    // ЭКСПОРТ
    // ================================================================

    window.LazyLoader = LazyLoader;

    // Добавляем стили для скелетонов
    const styles = document.createElement('style');
    styles.textContent = `
        /* ============================================================
           СКЕЛЕТОНЫ (заглушки для ленивой загрузки)
           ============================================================ */

        .card-skeleton {
            background: var(--color-bg-card, #fef9f3);
            border-radius: 15px;
            border: 2px solid var(--color-border, #d4a574);
            overflow: hidden;
            min-height: 380px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .skeleton-header {
            padding: 25px;
            background: linear-gradient(135deg, #e6a336, #d1891c);
            flex-shrink: 0;
        }

        .skeleton-body {
            padding: 25px;
            flex: 1;
            background: #fef9f3;
        }

        .skeleton-footer {
            padding: 15px 25px;
            background: #f5ebd8;
            border-top: 2px solid #d4a574;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .skeleton-line {
            background: linear-gradient(90deg, #e8ddd0 25%, #f0e8d8 50%, #e8ddd0 75%);
            background-size: 200% 100%;
            border-radius: 4px;
            animation: skeleton-shimmer 1.8s infinite;
            margin-bottom: 8px;
        }

        .skeleton-line:last-child {
            margin-bottom: 0;
        }

        .skeleton-title {
            height: 28px;
            width: 70%;
            border-radius: 6px;
        }

        .skeleton-subtitle {
            height: 18px;
            width: 50%;
            border-radius: 4px;
        }

        .skeleton-tag {
            height: 24px;
            width: 80px;
            border-radius: 12px;
            display: inline-block;
            margin-right: 6px;
            margin-bottom: 6px;
        }

        .skeleton-text {
            height: 14px;
            width: 100%;
            border-radius: 3px;
            margin-top: 12px;
        }

        .skeleton-text.short {
            width: 60%;
        }

        .skeleton-button {
            height: 32px;
            width: 80px;
            border-radius: 6px;
        }

        .skeleton-id {
            height: 16px;
            width: 60px;
            border-radius: 3px;
        }

        @keyframes skeleton-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }

        /* Адаптив для скелетонов */
        @media (max-width: 768px) {
            .card-skeleton { min-height: 320px; }
            .skeleton-title { height: 24px; width: 80%; }
            .skeleton-subtitle { height: 16px; width: 60%; }
            .skeleton-header { padding: 18px 15px; }
            .skeleton-body { padding: 18px 15px; }
            .skeleton-footer { padding: 12px 15px; }
        }

        @media (max-width: 480px) {
            .card-skeleton { min-height: 280px; }
            .skeleton-title { height: 20px; }
            .skeleton-subtitle { height: 14px; }
            .skeleton-tag { height: 20px; width: 60px; }
            .skeleton-text { height: 12px; }
        }
    `;
    document.head.appendChild(styles);

    console.log('✅ LazyLoader загружен');

})();