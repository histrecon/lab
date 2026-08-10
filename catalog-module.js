// catalog-module.js - исправленная версия (без бургера)

(function() {
    'use strict';

    // ============================================================
    // КОНФИГУРАЦИЯ
    // ============================================================

    const CONFIG = {
        types: {
            clubs: {
                dataFile: 'clubs.json',
                containerId: 'clubsContainer',
                statsId: 'stats',
                totalId: 'totalClubs',
                cardClass: 'club-card',
                headerClass: 'club-header',
                nameClass: 'club-name',
                locationClass: 'club-location',
                bodyClass: 'club-body',
                fieldClass: 'club-field',
                descriptionWrapperClass: 'club-description-wrapper',
                descriptionTextClass: 'club-description-text',
                descriptionFadeClass: 'club-description-fade',
                readMoreBtnClass: 'club-read-more-btn',
                footerClass: 'club-footer',
                linksClass: 'club-footer-links',
                vkLinkClass: 'vk-link',
                websiteLinkClass: 'website-link',
                idClass: 'club-id',
                eraTagClass: 'era-tag',
                fieldLabelClass: 'field-label',
                erasContainerClass: 'eras-container',
                dataKey: 'clubs',
                itemName: 'клубов',
                itemNameSingular: 'клуб',
                emptyMessage: 'Клубы не найдены'
            },
            festivals: {
                dataFile: 'festivals.json',
                containerId: 'festivalsContainer',
                statsId: 'stats',
                totalId: 'totalFestivals',
                cardClass: 'festival-card',
                headerClass: 'festival-header',
                nameClass: 'festival-name',
                locationClass: 'festival-location',
                bodyClass: 'festival-body',
                fieldClass: 'festival-field',
                descriptionWrapperClass: 'festival-description-wrapper',
                descriptionTextClass: 'festival-description-text',
                descriptionFadeClass: 'festival-description-fade',
                readMoreBtnClass: 'festival-read-more-btn',
                footerClass: 'festival-footer',
                linksClass: 'festival-footer-links',
                vkLinkClass: 'vk-link',
                websiteLinkClass: 'website-link',
                idClass: 'festival-id',
                eraTagClass: 'era-tag',
                fieldLabelClass: 'field-label',
                erasContainerClass: 'eras-container',
                dataKey: 'festivals',
                itemName: 'мероприятий',
                itemNameSingular: 'мероприятие',
                emptyMessage: 'Мероприятия не найдены'
            },
            shops: {
                dataFile: 'shops.json',
                containerId: 'shopsContainer',
                statsId: 'stats',
                totalId: 'totalShops',
                cardClass: 'shop-card',
                headerClass: 'shop-header',
                nameClass: 'shop-name',
                locationClass: 'shop-location',
                bodyClass: 'shop-body',
                fieldClass: 'shop-field',
                descriptionWrapperClass: 'shop-description-wrapper',
                descriptionTextClass: 'shop-description-text',
                descriptionFadeClass: 'shop-description-fade',
                readMoreBtnClass: 'shop-description-btn',
                footerClass: 'shop-footer',
                linksClass: 'shop-footer-links',
                vkLinkClass: 'vk-link',
                websiteLinkClass: 'website-link',
                idClass: 'shop-id',
                eraTagClass: 'era-tag',
                fieldLabelClass: 'field-label',
                erasContainerClass: 'eras-container',
                dataKey: 'shops',
                itemName: 'магазинов',
                itemNameSingular: 'магазин',
                emptyMessage: 'Магазины не найдены'
            }
        },
        map: {
            defaultCenter: [55.7558, 37.6176],
            defaultZoom: 4,
            cityZoom: 12
        },
        truncate: {
            maxLength: 40
        }
    };

    // ============================================================
    // СОСТОЯНИЕ
    // ============================================================

    let state = {
        type: null,
        allItems: [],
        filteredItems: [],
        countries: new Set(),
        cities: new Set(),
        eras: new Set(),
        specializations: new Set(),
        map: null,
        cityMarkers: {},
        config: null,
        lazyLoader: null
    };

    // ============================================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================================================

    function getCatalogType() {
        const path = window.location.pathname.split('/').pop() || '';
        if (path.includes('clubs')) return 'clubs';
        if (path.includes('festivals')) return 'festivals';
        if (path.includes('shops')) return 'shops';
        return null;
    }

    function getConfig() {
        const type = getCatalogType();
        if (!type || !CONFIG.types[type]) {
            console.error('Неизвестный тип каталога:', type);
            return null;
        }
        return CONFIG.types[type];
    }

    function hasCityCoordinates() {
        return typeof cityCoordinates !== 'undefined';
    }

    function getCityCoordinates(city) {
        if (hasCityCoordinates() && cityCoordinates[city]) {
            return cityCoordinates[city];
        }
        return [55.7558 + (Math.random() - 0.5) * 15, 37.6176 + (Math.random() - 0.5) * 30];
    }

    window.setCurrentDate = function() {
        const now = new Date();
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = now.toLocaleDateString('ru-RU', options);
        const el = document.getElementById('currentDate');
        if (el) el.textContent = formattedDate;
    };

    function getSearchTerm() {
        const input = document.getElementById('searchInput');
        return input ? input.value.toLowerCase().trim() : '';
    }

    function getFilterValue(id) {
        const el = document.getElementById(id);
        return el ? el.value : '';
    }

    function renderEraTags(eras, eraTagClass) {
        if (!eras || eras.length === 0) return '<span style="color: #8b7355;">Не указано</span>';
        return eras.map(era => 
            `<span class="${eraTagClass}">${era}</span>`
        ).join('');
    }

    function needsTruncate(text) {
        return text && text.length > CONFIG.truncate.maxLength;
    }

    function renderDescription(text, wrapperClass, textClass, fadeClass, btnClass, itemId) {
        if (!text) text = 'Описание отсутствует';
        const needsTrunc = needsTruncate(text);

        return `
            <div class="${wrapperClass} ${needsTrunc ? '' : 'expanded'}">
                <div class="${textClass}">${text}</div>
                ${needsTrunc ? `<div class="${fadeClass}"></div>` : ''}
            </div>
            ${needsTrunc ? `<button class="${btnClass}" data-item-id="${itemId}">Читать далее ▼</button>` : ''}
        `;
    }

    function renderFooterLinks(vk, website, vkClass, websiteClass) {
        let html = '';
        if (vk) {
            html += `<a href="${vk}" target="_blank" class="${vkClass}">
                <span>VK</span>
                <span>→</span>
            </a>`;
        }
        if (website) {
            html += `<a href="${website}" target="_blank" class="${websiteClass}">
                <span>🌐</span>
                <span>Сайт</span>
            </a>`;
        }
        return html;
    }

    // ============================================================
    // КЛАСС LAZYLOADER (встроенный, без внешних зависимостей)
    // ============================================================

    class LazyLoader {
        constructor(options = {}) {
            this.rootMargin = options.rootMargin || '200px';
            this.threshold = options.threshold || 0.1;
            this.items = [];
            this.container = null;
            this.renderCallback = null;
            this.observer = null;
            this.loaded = new Set();
            this.initialRenderDone = false;
        }

        init(container, items, renderCallback) {
            this.container = container;
            this.items = items;
            this.renderCallback = renderCallback;
            this.loaded.clear();
            this.initialRenderDone = false;
            this.renderPlaceholders();
            this.setupObserver();
        }

        renderPlaceholders() {
            this.container.innerHTML = '';
            // Показываем первые 20 элементов сразу
            const initialCount = Math.min(20, this.items.length);
            for (let i = 0; i < initialCount; i++) {
                if (i < this.items.length) {
                    const card = this.renderCallback(this.items[i], i);
                    this.container.appendChild(card);
                    this.loaded.add(i);
                }
            }
            // Для остальных создаём плейсхолдеры
            for (let i = initialCount; i < this.items.length; i++) {
                const placeholder = this.createPlaceholder(i);
                this.container.appendChild(placeholder);
            }
            this.initialRenderDone = true;
        }

        createPlaceholder(index) {
            const div = document.createElement('div');
            div.className = 'card-placeholder';
            div.dataset.index = index;
            div.style.cssText = `
                min-height: 350px;
                background: linear-gradient(135deg, #f0e8d8 25%, #e8ddd0 50%, #f0e8d8 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
                border-radius: 15px;
            `;
            return div;
        }

        setupObserver() {
            if (this.observer) {
                this.observer.disconnect();
            }
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const placeholder = entry.target;
                        const index = parseInt(placeholder.dataset.index);
                        if (!isNaN(index) && !this.loaded.has(index) && index < this.items.length) {
                            this.loaded.add(index);
                            const card = this.renderCallback(this.items[index], index);
                            placeholder.replaceWith(card);
                        }
                    }
                });
            }, { 
                rootMargin: this.rootMargin,
                threshold: this.threshold 
            });

            // Наблюдаем за всеми плейсхолдерами
            this.container.querySelectorAll('.card-placeholder').forEach(el => {
                this.observer.observe(el);
            });
        }

        updateItems(newItems) {
            this.items = newItems;
            this.loaded.clear();
            this.initialRenderDone = false;
            // Полная перерисовка
            this.renderPlaceholders();
            this.setupObserver();
        }

        destroy() {
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
            this.loaded.clear();
            this.initialRenderDone = false;
        }
    }

    // ============================================================
    // СОЗДАНИЕ КАРТОЧКИ
    // ============================================================

    function createItemCard(item, index) {
        const config = state.config;
        const card = document.createElement('div');
        card.className = config.cardClass;

        const eraTags = item.eras ? renderEraTags(item.eras, config.eraTagClass) : '';
        const description = item.description || 'Описание отсутствует';
        const needsDescTruncate = needsTruncate(description);

        let bodyContent = '';

        // Специализация для магазинов
        if (state.type === 'shops' && item.specialization) {
            const spec = item.specialization;
            const needsSpecTruncate = needsTruncate(spec);
            bodyContent += `
                <div class="${config.fieldClass}">
                    <div class="${config.fieldLabelClass}">🛠️ Специализация:</div>
                    <div class="shop-specialization-wrapper ${needsSpecTruncate ? '' : 'expanded'}">
                        <div class="shop-specialization-text">${spec}</div>
                        ${needsSpecTruncate ? `<div class="shop-specialization-fade"></div>` : ''}
                    </div>
                    ${needsSpecTruncate ? `<button class="shop-specialization-btn" data-item-id="${item.id}">Читать далее ▼</button>` : ''}
                </div>
            `;
        }

        // Описание
        const descHtml = renderDescription(
            description,
            config.descriptionWrapperClass,
            config.descriptionTextClass,
            config.descriptionFadeClass,
            config.readMoreBtnClass,
            item.id
        );

        bodyContent += `
            <div class="${config.fieldClass}">
                <div class="${config.fieldLabelClass}">📝 Описание:</div>
                ${descHtml}
            </div>
        `;

        const linksHtml = renderFooterLinks(item.vk, item.website, config.vkLinkClass, config.websiteLinkClass);

        card.innerHTML = `
            <div class="${config.headerClass}">
                <div class="${config.nameClass}">${item.name}</div>
                <div class="${config.locationClass}" data-city="${item.city}">
                    <span>📍</span>
                    <span>${item.city}, ${item.country}</span>
                </div>
            </div>
            <div class="${config.bodyClass}">
                ${item.eras ? `
                    <div class="${config.fieldClass}">
                        <div class="${config.fieldLabelClass}">🏰 Исторические эпохи:</div>
                        <div class="${config.erasContainerClass}">${eraTags}</div>
                    </div>
                ` : ''}
                ${bodyContent}
            </div>
            <div class="${config.footerClass}">
                <div class="${config.linksClass}">
                    ${linksHtml}
                </div>
                <div class="${config.idClass}">ID: ${item.id}</div>
            </div>
        `;

        attachCardEvents(card, item);
        return card;
    }

    function attachCardEvents(card, item) {
        const config = state.config;

        const locationEl = card.querySelector(`.${config.locationClass}`);
        if (locationEl) {
            locationEl.addEventListener('click', function(e) {
                e.stopPropagation();
                selectCity(this.dataset.city);
            });
        }

        const readMoreBtns = card.querySelectorAll(`.${config.readMoreBtnClass}`);
        readMoreBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const wrapper = this.closest(`.${config.fieldClass}`).querySelector(`.${config.descriptionWrapperClass}`);
                if (!wrapper) return;
                const isExpanded = wrapper.classList.contains('expanded');
                
                if (isExpanded) {
                    wrapper.classList.remove('expanded');
                    this.textContent = 'Читать далее ▼';
                } else {
                    wrapper.classList.add('expanded');
                    this.textContent = 'Свернуть ▲';
                }
            });
        });

        const specBtns = card.querySelectorAll('.shop-specialization-btn');
        specBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const wrapper = this.closest(`.${config.fieldClass}`).querySelector('.shop-specialization-wrapper');
                if (!wrapper) return;
                const isExpanded = wrapper.classList.contains('expanded');
                
                if (isExpanded) {
                    wrapper.classList.remove('expanded');
                    this.textContent = 'Читать далее ▼';
                } else {
                    wrapper.classList.add('expanded');
                    this.textContent = 'Свернуть ▲';
                }
            });
        });
    }

    // ============================================================
    // ОТОБРАЖЕНИЕ
    // ============================================================

    function displayItems(items) {
        const config = state.config;
        const container = document.getElementById(config.containerId);
        if (!container) return;

        if (items.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <h3>${config.emptyMessage}</h3>
                    <p>Попробуйте изменить параметры поиска или фильтры</p>
                </div>
            `;
            if (state.lazyLoader) {
                state.lazyLoader.destroy();
                state.lazyLoader = null;
            }
            return;
        }

        if (!state.lazyLoader) {
            state.lazyLoader = new LazyLoader({
                rootMargin: '200px'
            });
        }

        const renderCard = (item, index) => createItemCard(item, index);

        if (state.lazyLoader.items.length === 0) {
            state.lazyLoader.init(container, items, renderCard);
        } else {
            state.lazyLoader.updateItems(items);
        }
    }

    // ============================================================
    // СТАТИСТИКА
    // ============================================================

    function updateStats() {
        const config = state.config;
        const statsElement = document.getElementById(config.statsId);
        const totalElement = document.getElementById(config.totalId);

        if (totalElement) {
            totalElement.textContent = state.allItems.length;
        }

        if (!statsElement) return;

        if (state.filteredItems.length === state.allItems.length) {
            statsElement.innerHTML = `Показаны все <strong>${state.allItems.length}</strong> ${config.itemName}`;
        } else {
            const uniqueCities = new Set(state.filteredItems.map(item => item.city)).size;
            let extraInfo = `<small>в <strong>${uniqueCities}</strong> городах</small>`;

            if (state.type === 'shops') {
                const uniqueSpecs = new Set(
                    state.filteredItems
                        .filter(item => item.specialization)
                        .flatMap(item => item.specialization.split(',').map(s => s.trim()).filter(s => s))
                ).size;
                extraInfo = `<small>в <strong>${uniqueCities}</strong> городах, <strong>${uniqueSpecs}</strong> специализаций</small>`;
            }

            statsElement.innerHTML = `
                Найдено <strong>${state.filteredItems.length}</strong> ${config.itemName} из <strong>${state.allItems.length}</strong>
                <br>
                ${extraInfo}
            `;
        }
    }

    // ============================================================
    // ФИЛЬТРЫ
    // ============================================================

    function initFilters() {
        const countryFilter = document.getElementById('countryFilter');
        const cityFilter = document.getElementById('cityFilter');
        const eraFilter = document.getElementById('eraFilter');
        const resetButton = document.getElementById('resetButton');

        const sortAndAppend = (set, element) => {
            if (!element) return;
            while (element.options.length > 1) element.remove(1);
            Array.from(set).sort().forEach(value => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                element.appendChild(option);
            });
        };

        sortAndAppend(state.countries, countryFilter);
        sortAndAppend(state.cities, cityFilter);
        sortAndAppend(state.eras, eraFilter);

        if (state.type === 'shops') {
            const specFilter = document.getElementById('specializationFilter');
            if (specFilter) {
                while (specFilter.options.length > 1) specFilter.remove(1);
                Array.from(state.specializations).sort().forEach(spec => {
                    const option = document.createElement('option');
                    option.value = spec;
                    option.textContent = spec;
                    specFilter.appendChild(option);
                });
            }
        }

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let timeout;
            searchInput.addEventListener('input', function() {
                clearTimeout(timeout);
                timeout = setTimeout(applyFilters, 300);
            });
        }

        countryFilter?.addEventListener('change', applyFilters);
        cityFilter?.addEventListener('change', function() {
            applyFilters();
            const selectedCity = this.value;
            if (selectedCity && state.map) {
                centerMapOnCity(selectedCity);
            }
        });
        eraFilter?.addEventListener('change', applyFilters);

        const specFilter = document.getElementById('specializationFilter');
        if (specFilter) specFilter.addEventListener('change', applyFilters);

        resetButton?.addEventListener('click', resetFilters);
    }

    function applyFilters() {
        const searchTerm = getSearchTerm();
        const selectedCountry = getFilterValue('countryFilter');
        const selectedCity = getFilterValue('cityFilter');
        const selectedEra = getFilterValue('eraFilter');
        const selectedSpecialization = getFilterValue('specializationFilter');

        state.filteredItems = state.allItems.filter(item => {
            const matchesSearch = searchTerm === '' || 
                (item.name && item.name.toLowerCase().includes(searchTerm)) || 
                (item.city && item.city.toLowerCase().includes(searchTerm)) ||
                (item.specialization && item.specialization.toLowerCase().includes(searchTerm));

            const matchesCountry = selectedCountry === '' || item.country === selectedCountry;
            const matchesCity = selectedCity === '' || item.city === selectedCity;
            const matchesEra = selectedEra === '' || (item.eras && item.eras.includes(selectedEra));
            
            const matchesSpecialization = selectedSpecialization === '' || 
                (item.specialization && item.specialization.toLowerCase().includes(selectedSpecialization.toLowerCase()));

            return matchesSearch && matchesCountry && matchesCity && matchesEra && matchesSpecialization;
        });

        displayItems(state.filteredItems);
        updateStats();

        const container = document.getElementById(state.config.containerId);
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function resetFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('countryFilter').value = '';
        document.getElementById('cityFilter').value = '';
        document.getElementById('eraFilter').value = '';
        const specFilter = document.getElementById('specializationFilter');
        if (specFilter) specFilter.value = '';

        applyFilters();

        if (state.map) {
            state.map.setView(CONFIG.map.defaultCenter, CONFIG.map.defaultZoom);
        }
    }

    // ============================================================
    // КАРТА
    // ============================================================

    function initMap() {
        if (typeof L === 'undefined') {
            console.warn('Leaflet не загружен');
            return;
        }

        state.map = L.map('map').setView(CONFIG.map.defaultCenter, CONFIG.map.defaultZoom);
        state.map.attributionControl.remove();

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(state.map);

        L.control.zoom({
            position: 'topright'
        }).addTo(state.map);

        addCityMarkers();

        document.getElementById('cityFilter')?.addEventListener('change', function() {
            const selectedCity = this.value;
            if (selectedCity && state.map) {
                centerMapOnCity(selectedCity);
            }
        });
    }

    function addCityMarkers() {
        const itemsByCity = {};
        state.allItems.forEach(item => {
            if (!itemsByCity[item.city]) {
                itemsByCity[item.city] = [];
            }
            itemsByCity[item.city].push(item);
        });

        Object.keys(itemsByCity).forEach(city => {
            const cityItems = itemsByCity[city];
            const cityCoord = getCityCoordinates(city);

            if (cityCoord && state.map) {
                const itemCount = cityItems.length;

                const flagIcon = L.divIcon({
                    className: 'flag-marker',
                    html: `
                        <div class="flag-marker">
                            <div class="flag-pole"></div>
                            <div class="flag-body">
                                <div class="flag-count">${itemCount}</div>
                            </div>
                        </div>
                    `,
                    iconSize: [40, 50],
                    iconAnchor: [20, 50],
                    popupAnchor: [0, -50]
                });

                const marker = L.marker(cityCoord, { icon: flagIcon }).addTo(state.map);

                const eras = new Set();
                const sampleItems = cityItems.slice(0, 3);
                cityItems.forEach(item => {
                    if (item.eras) {
                        item.eras.forEach(era => eras.add(era));
                    }
                });

                const eraList = Array.from(eras).slice(0, 5).join(', ') + (eras.size > 5 ? '...' : '');

                let itemList = '';
                sampleItems.forEach(item => {
                    itemList += `<div style="margin: 5px 0; padding: 5px; background: #ffe4c4; border-radius: 3px;">
                        <strong>${item.name}</strong>
                        ${item.specialization ? `<div><small>${item.specialization}</small></div>` : ''}
                    </div>`;
                });

                if (cityItems.length > 3) {
                    itemList += `<div style="margin: 5px 0; color: #8b4513; font-style: italic;">... и еще ${cityItems.length - 3} ${state.config.itemName}</div>`;
                }

                marker.bindPopup(`
                    <div style="min-width: 250px;">
                        <h3 style="margin: 0 0 10px 0; color: #8b4513;">${city}</h3>
                        <p><strong>${state.config.itemName} в городе:</strong> ${itemCount}</p>
                        <p><strong>Исторические эпохи:</strong> ${eraList}</p>
                        ${itemCount > 0 ? `<p><strong>Примеры ${state.config.itemName}:</strong></p>${itemList}` : ''}
                        <button onclick="window.selectCity('${city}')" style="
                            background: linear-gradient(135deg, #e6a336, #d1891c);
                            color: #333;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-weight: bold;
                            margin-top: 10px;
                            width: 100%;
                        ">
                            Показать ${state.config.itemName} (${itemCount})
                        </button>
                    </div>
                `);

                marker.on('click', function() {
                    selectCity(city);
                });

                state.cityMarkers[city] = marker;
            }
        });
    }

    function centerMapOnCity(city) {
        const cityCoord = getCityCoordinates(city);
        if (cityCoord && state.map) {
            state.map.setView(cityCoord, CONFIG.map.cityZoom);
            if (state.cityMarkers[city]) {
                setTimeout(() => {
                    state.cityMarkers[city].openPopup();
                }, 500);
            }
        }
    }

    window.selectCity = function(city) {
        const cityFilter = document.getElementById('cityFilter');
        if (cityFilter) {
            cityFilter.value = city;
        }
        applyFilters();
        const statsEl = document.getElementById(state.config?.statsId);
        if (statsEl) {
            statsEl.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // ============================================================
    // НАВИГАЦИЯ (без бургера)
    // ============================================================

    function loadNavigationModule() {
        if (document.getElementById('mainNavigation')) {
            console.log('✅ Навигация уже загружена');
            return Promise.resolve();
        }

        return fetch('navigation-module.html')
            .then(response => {
                if (!response.ok) throw new Error('Не удалось загрузить модуль навигации');
                return response.text();
            })
            .then(html => {
                document.body.insertAdjacentHTML('afterbegin', html);
                console.log('✅ Навигация загружена через fetch');
                // Подсветка активной страницы (уже есть в navigation-module.html)
            })
            .catch(error => {
                console.warn('⚠️ Ошибка загрузки навигации:', error);
                createFallbackNavigation();
            });
    }

    function createFallbackNavigation() {
        if (document.getElementById('fallbackNav')) return;
        
        const fallbackNav = document.createElement('nav');
        fallbackNav.id = 'fallbackNav';
        fallbackNav.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(30, 20, 10, 0.95);
            border-bottom: 2px solid #d4a574;
            z-index: 999;
            padding: 6px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 4px;
            min-height: 48px;
        `;
        fallbackNav.innerHTML = `
            <a href="index.html" style="color: #e6a336; text-decoration: none; font-weight: bold; font-size: 0.9rem; padding: 4px 10px; border: 1px solid #d4a574; border-radius: 5px; background: rgba(139, 69, 19, 0.2); white-space: nowrap;">
                🏠 РеконХаб
            </a>
            <div style="display: flex; gap: 4px; flex-wrap: wrap; align-items: center;">
                <a href="index.html" style="color: #f5ebd8; text-decoration: none; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 0.8rem;">Главная</a>
                <a href="clubs.html" style="color: #f5ebd8; text-decoration: none; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 0.8rem;">Клубы</a>
                <a href="festivals.html" style="color: #f5ebd8; text-decoration: none; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 0.8rem;">Мероприятия</a>
                <a href="shops.html" style="color: #f5ebd8; text-decoration: none; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 0.8rem;">Магазины</a>
                <a href="feedback.html" style="color: #333; text-decoration: none; padding: 4px 10px; background: linear-gradient(135deg, #e6a336, #d1891c); border-radius: 4px; font-weight: 700; font-size: 0.8rem; border: 1px solid #c17e1a;">💬 Связь</a>
            </div>
        `;
        document.body.insertAdjacentElement('afterbegin', fallbackNav);
        
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const links = fallbackNav.querySelectorAll('a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.style.background = 'linear-gradient(135deg, #e6a336, #d1891c)';
                link.style.color = '#333';
                link.style.borderColor = '#c17e1a';
                link.style.borderRadius = '4px';
            }
        });
        
        console.log('⚠️ Используется резервная навигация');
    }

    // ============================================================
    // ЗАГРУЗКА ДАННЫХ
    // ============================================================

    async function loadData() {
        const config = getConfig();
        if (!config) return;

        state.config = config;

        try {
            const response = await fetch(config.dataFile);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            processData(data[config.dataKey] || []);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            const container = document.getElementById(state.config.containerId);
            if (container) {
                container.innerHTML = `
                    <div class="no-results">
                        <h3>⚠️ Ошибка загрузки данных</h3>
                        <p>Не удалось загрузить данные. Проверьте наличие файла ${state.config.dataFile}</p>
                        <button onclick="location.reload()" style="
                            margin-top: 15px;
                            padding: 10px 30px;
                            background: linear-gradient(135deg, #e6a336, #d1891c);
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            font-size: 1rem;
                            color: #333;
                        ">Обновить</button>
                    </div>
                `;
            }
        }
    }

    function processData(items) {
        state.allItems = items;

        state.countries = new Set();
        state.cities = new Set();
        state.eras = new Set();
        state.specializations = new Set();

        state.allItems.forEach(item => {
            state.countries.add(item.country);
            state.cities.add(item.city);
            if (item.eras) {
                item.eras.forEach(era => state.eras.add(era));
            }
            if (state.type === 'shops' && item.specialization) {
                const specs = item.specialization.split(',').map(s => s.trim()).filter(s => s);
                specs.forEach(spec => state.specializations.add(spec));
            }
        });

        initFilters();
        // Инициализируем карту после загрузки данных
        if (typeof L !== 'undefined' && !state.map) {
            initMap();
        }
        state.filteredItems = [...state.allItems];
        displayItems(state.filteredItems);
        updateStats();
    }

    // ============================================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================================

    function init() {
        state.type = getCatalogType();
        if (!state.type) {
            console.warn('Не удалось определить тип каталога');
            return;
        }

        console.log(`📋 Инициализация модуля каталога: ${state.type}`);

        if (typeof window.setCurrentDate === 'function') {
            window.setCurrentDate();
        }

        // Сначала загружаем навигацию, потом данные
        loadNavigationModule()
            .then(() => {
                loadData();
            })
            .catch(() => {
                loadData();
            });
    }

    // ============================================================
    // ЗАПУСК
    // ============================================================

    // Добавляем стили для скелетонов
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes skeleton-loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        .card-placeholder {
            animation: skeleton-loading 1.5s infinite;
            border-radius: 15px;
            min-height: 350px;
        }
        .card-placeholder:first-child {
            animation-delay: 0s;
        }
        .card-placeholder:nth-child(2) {
            animation-delay: 0.1s;
        }
        .card-placeholder:nth-child(3) {
            animation-delay: 0.2s;
        }
        .card-placeholder:nth-child(4) {
            animation-delay: 0.3s;
        }
        .card-placeholder:nth-child(5) {
            animation-delay: 0.4s;
        }
        .card-placeholder:nth-child(6) {
            animation-delay: 0.5s;
        }
    `;
    document.head.appendChild(styleSheet);

    // Запускаем
    function safeInit() {
        try {
            init();
        } catch (error) {
            console.error('Ошибка инициализации каталога:', error);
            const containers = document.querySelectorAll('.clubs-container, .festivals-container, .shops-container');
            containers.forEach(container => {
                container.innerHTML = `
                    <div class="no-results">
                        <h3>⚠️ Ошибка загрузки</h3>
                        <p>Не удалось загрузить модуль каталога. Пожалуйста, обновите страницу.</p>
                        <button onclick="location.reload()" style="
                            margin-top: 15px;
                            padding: 10px 30px;
                            background: linear-gradient(135deg, #e6a336, #d1891c);
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            font-size: 1rem;
                            color: #333;
                        ">Обновить</button>
                    </div>
                `;
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', safeInit);
    } else {
        safeInit();
    }

    // ============================================================
    // ЭКСПОРТ
    // ============================================================

    window.catalogModule = {
        state: state,
        CONFIG: CONFIG,
        getCatalogType: getCatalogType,
        getConfig: getConfig,
        loadData: loadData,
        applyFilters: applyFilters,
        resetFilters: resetFilters,
        selectCity: window.selectCity,
        centerMapOnCity: centerMapOnCity,
        renderEraTags: renderEraTags,
        renderDescription: renderDescription,
        renderFooterLinks: renderFooterLinks,
        loadNavigationModule: loadNavigationModule
    };

})();
