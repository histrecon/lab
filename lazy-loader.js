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
                batchSize: 20 // Загружаем по 20 за раз
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
        // Обновляем данные
        state.lazyLoader.updateItems(items);
    }
}
