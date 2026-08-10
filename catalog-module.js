// catalog-module.js - Единый модуль для страниц каталога
// Версия 3.1 — с ленивой загрузкой и бургер-меню

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

        // Обработчики событий
        attachCardEvents(card, item);

        return card;
    }

    function attachCardEvents(card, item) {
        const config = state.config;

        // Клик по локации
        const locationEl = card.querySelector(`.${config.locationClass}`);
        if (locationEl) {
            locationEl.addEventListener('click', function(e) {
                e.stopPropagation();
                selectCity(this.dataset.city);
            });
        }

        // Кнопки "Читать далее"
        const readMoreBtns = card.querySelectorAll(`.${config.readMoreBtnClass}`);
        readMoreBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const wrapper = this.closest(`.${config.fieldClass}`).querySelector(`.${config.descriptionWrapperClass}`);
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

        // Кнопки специализации для магазинов
        const specBtns = card.querySelectorAll('.shop-specialization-btn');
        specBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const wrapper = this.closest(`.${config.fieldClass}`).querySelector('.shop-specialization-wrapper');
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
    // ОТОБРАЖЕНИЕ С ЛЕНИВОЙ ЗАГРУЗКОЙ
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

        // Создаём LazyLoader если его нет
        if (!state.lazyLoader) {
            if (typeof LazyLoader !== 'undefined') {
                state.lazyLoader = new LazyLoader({
                    rootMargin: '200px',
                    batchSize: 20
                });
            } else {
                renderAll(items);
                return;
            }
        }

        // Функция рендеринга одной карточки
        const renderCard = (item, index) => {
            return createItemCard(item, index);
        };

        // Если это первая инициализация
        if (state.lazyLoader.items.length === 0) {
            state.lazyLoader.init(container, items, renderCard);
        } else {
            state.lazyLoader.updateItems(items);
        }
    }

    function renderAll(items) {
        const container = document.getElementById(state.config.containerId);
        if (!container) return;

        container.innerHTML = '';
        items.forEach(item => {
            const card = createItemCard(item);
            container.appendChild(card);
        });
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

        // События с debounce для поиска
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

        // Кнопка расшифровки тегов
        const tagsBtn = document.getElementById('tagsInfoButton');
        if (tagsBtn && typeof tagsModal !== 'undefined') {
            // Модалка уже подгружается через tags-info.js
        }
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

        // Возвращаем скролл к началу списка
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
    // НАВИГАЦИЯ
    // ============================================================

    function loadNavigationModule() {
        // Проверяем, не загружена ли уже навигация
        if (document.getElementById('mainNavigation')) {
            console.log('Навигация уже загружена');
            // Инициализируем бургер
            if (typeof window.initBurgerMenu === 'function') {
                window.initBurgerMenu();
            }
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
                
                // Инициализируем бургер после загрузки
                if (typeof window.initBurgerMenu === 'function') {
                    window.initBurgerMenu();
                } else {
                    // Если функция ещё не определена, ждём и пробуем снова
                    setTimeout(() => {
                        if (typeof window.initBurgerMenu === 'function') {
                            window.initBurgerMenu();
                        } else {
                            console.warn('⚠️ initBurgerMenu не найдена');
                            // Запускаем встроенный скрипт из navigation-module.html
                            const scripts = document.querySelectorAll('#mainNavigation script');
                            if (scripts.length > 0) {
                                // eval(scripts[scripts.length - 1].textContent);
                            }
                        }
                    }, 200);
                }
            })
            .catch(error => {
                console.warn('Ошибка загрузки навигации:', error);
            });
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
            state.allItems = data[config.dataKey] || [];

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
            initMap();
            state.filteredItems = [...state.allItems];
            displayItems(state.filteredItems);
            updateStats();

        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            const container = document.getElementById(state.config.containerId);
            if (container) {
                container.innerHTML = `
                    <div class="no-results">
                        <h3>Ошибка загрузки данных</h3>
                        <p>Не удалось загрузить данные. Проверьте наличие файла ${state.config.dataFile}</p>
                    </div>
                `;
            }
        }
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

        // Сначала загружаем навигацию
        loadNavigationModule()
            .then(() => {
                // Загружаем LazyLoader если не загружен
                if (typeof LazyLoader === 'undefined') {
                    return new Promise((resolve) => {
                        const script = document.createElement('script');
                        script.src = 'lazy-loader.js';
                        script.onload = function() {
                            console.log('✅ LazyLoader загружен');
                            resolve();
                        };
                        script.onerror = function() {
                            console.warn('⚠️ LazyLoader не загружен, работаем без него');
                            resolve();
                        };
                        document.head.appendChild(script);
                    });
                }
            })
            .then(() => {
                // Загружаем данные
                loadData();
            })
            .catch(() => {
                // В любом случае загружаем данные
                loadData();
            });

        // Подключаем обработку тегов
        if (typeof tagsModal === 'undefined') {
            const script = document.createElement('script');
            script.src = 'tags-info.js';
            document.body.appendChild(script);
        }
    }

    // ============================================================
    // ЗАПУСК
    // ============================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ============================================================
    // ЭКСПОРТ
    // ============================================================

    window.loadNavigationModule = loadNavigationModule;
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
        loadNavigationModule: loadNavigationModule,
        setCurrentDate: window.setCurrentDate
    };

})();
