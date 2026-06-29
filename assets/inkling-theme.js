(() => {
  const STORAGE_KEYS = {
    selectedStore: 'inkling:selectedStore',
  };

  const selectors = {
    locationTrigger: '[data-location-trigger]',
    locationLabel: '[data-location-label]',
    storeModal: '[data-store-modal]',
    storeModalClose: '[data-store-modal-close]',
    storeResults: '[data-store-results]',
    storeSearch: '[data-store-search]',
  };

  const stores = [
    {
      id: 'west-hollywood',
      name: 'West Hollywood',
      address1: '7969 Santa Monica Blvd',
      city: 'West Hollywood',
      state: 'CA',
      zip: '90046',
      timezone: 'America/Los_Angeles',
      hoursLabel: 'Mon–Fri 10–6, Sat 11–5',
    },
    {
      id: 'austin',
      name: 'Austin',
      address1: '600 North Lamar Blvd',
      city: 'Austin',
      state: 'TX',
      zip: '78703',
      timezone: 'America/Chicago',
      hoursLabel: 'Mon–Fri 9–5',
    },
    {
      id: 'union',
      name: 'Union',
      address1: '9039 US-42',
      city: 'Union',
      state: 'KY',
      zip: '41091',
      timezone: 'America/New_York',
      hoursLabel: 'Tue–Sat 10–6',
    },
  ];

  const getCartUpdateUrl = () => {
    if (window.Theme?.routes?.cart_update_url) {
      return `${window.Theme.routes.cart_update_url}.js`;
    }

    if (window.Shopify?.routes?.root) {
      return `${window.Shopify.routes.root}cart/update.js`;
    }

    return '/cart/update.js';
  };

  const saveCartAttributes = async (attributes) => {
    const response = await fetch(getCartUpdateUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attributes }),
    });

    if (!response.ok) {
      throw new Error(`Unable to save cart attributes: ${response.status}`);
    }

    return response.json();
  };

  const getSelectedStore = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.selectedStore) || 'null');
    } catch {
      return null;
    }
  };

  const updateLocationLabels = (store) => {
    document.querySelectorAll(selectors.locationLabel).forEach((label) => {
      label.textContent = store?.name || 'Choose Store';
    });
  };

  const openStoreModal = () => {
    const modal = document.querySelector(selectors.storeModal);
    if (!modal) return;

    modal.hidden = false;
    document.documentElement.classList.add('inkling-store-modal-open');

    renderStores(stores);

    const search = modal.querySelector(selectors.storeSearch);
    search?.focus();
  };

  const closeStoreModal = () => {
    const modal = document.querySelector(selectors.storeModal);
    if (!modal) return;

    modal.hidden = true;
    document.documentElement.classList.remove('inkling-store-modal-open');
  };

  const storeMatchesQuery = (store, query) => {
    if (!query) return true;

    const normalizedQuery = query.toLowerCase().trim();

    return [store.name, store.address1, store.city, store.state, store.zip]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedQuery));
  };

  const renderStores = (storeList) => {
    const results = document.querySelector(selectors.storeResults);
    if (!results) return;

    if (!storeList.length) {
      results.innerHTML = '<p>No stores found. Try another city or ZIP.</p>';
      return;
    }

    results.innerHTML = storeList
      .map((store) => {
        return `
          <button
            type="button"
            class="inkling-store-card"
            data-store-id="${store.id}"
          >
            <strong>${store.name}</strong>
            <span>${store.address1}</span>
            <span>${store.city}, ${store.state} ${store.zip}</span>
            <span>${store.hoursLabel}</span>
          </button>
        `;
      })
      .join('');
  };

  const selectStore = async (store) => {
    localStorage.setItem(STORAGE_KEYS.selectedStore, JSON.stringify(store));
    updateLocationLabels(store);

    await saveCartAttributes({
      selected_store_id: store.id,
      selected_store_name: store.name,
      selected_store_address: `${store.address1}, ${store.city}, ${store.state} ${store.zip}`,
      selected_store_timezone: store.timezone,

      appointment_store_id: '',
      appointment_store_name: '',
      appointment_date: '',
      appointment_time: '',
      appointment_datetime: '',
    });

    closeStoreModal();
  };

  const initStoreSelector = () => {
    document.addEventListener('click', async (event) => {
      const trigger = event.target.closest(selectors.locationTrigger);

      if (trigger) {
        event.preventDefault();
        openStoreModal();
        return;
      }

      const closeTrigger = event.target.closest(selectors.storeModalClose);

      if (closeTrigger) {
        event.preventDefault();
        closeStoreModal();
        return;
      }

      const storeCard = event.target.closest('[data-store-id]');

      if (storeCard) {
        event.preventDefault();

        const store = stores.find((item) => item.id === storeCard.dataset.storeId);
        if (!store) return;

        try {
          await selectStore(store);
        } catch (error) {
          console.error(error);
          alert('Sorry, we could not save your store. Please try again.');
        }
      }
    });

    document.addEventListener('input', (event) => {
      const search = event.target.closest(selectors.storeSearch);
      if (!search) return;

      const filteredStores = stores.filter((store) => {
        return storeMatchesQuery(store, search.value);
      });

      renderStores(filteredStores);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeStoreModal();
      }
    });
  };

  const init = () => {
    const savedStore = getSelectedStore();

    if (savedStore) {
      updateLocationLabels(savedStore);
    }

    initStoreSelector();
  };

  document.addEventListener('DOMContentLoaded', init);
})();
