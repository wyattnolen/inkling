(() => {
  const STORAGE_KEYS = {
    selectedStore: 'inkling:selectedStore',
    appointment: 'inkling:appointment',
  };

  const selectors = {
    locationTrigger: '[data-location-trigger]',
    locationLabel: '[data-location-label]',
    checkoutButton: '[name="checkout"], [href="/checkout"]',
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
      hours: {
        monday: { open: '10:00', close: '18:00' },
        tuesday: { open: '10:00', close: '18:00' },
        wednesday: { open: '10:00', close: '18:00' },
        thursday: { open: '10:00', close: '18:00' },
        friday: { open: '10:00', close: '19:00' },
        saturday: { open: '11:00', close: '17:00' },
        sunday: null,
      },
    },
  ];

  const saveCartAttributes = async (attributes) => {
    const response = await fetch(`${window.Shopify.routes.root}cart/update.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attributes }),
    });

    if (!response.ok) {
      throw new Error('Unable to save cart attributes.');
    }

    return response.json();
  };

  const updateLocationLabels = (store) => {
    document.querySelectorAll(selectors.locationLabel).forEach((label) => {
      label.textContent = store?.name || 'Choose Store';
    });
  };

  const initStoreSelector = () => {
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest(selectors.locationTrigger);
      if (!trigger) return;

      event.preventDefault();

      // Temporary first step:

      console.log('Open store selector modal');
    });
  };

  const initCheckoutGuard = () => {
    document.addEventListener('click', (event) => {
      const checkoutButton = event.target.closest(selectors.checkoutButton);
      if (!checkoutButton) return;

      const selectedStore = localStorage.getItem(STORAGE_KEYS.selectedStore);
      const appointment = localStorage.getItem(STORAGE_KEYS.appointment);

      if (!selectedStore) {
        event.preventDefault();
        console.log('Open store selector modal before checkout');
        return;
      }

      if (!appointment) {
        event.preventDefault();
        console.log('Open appointment scheduler before checkout');
      }
    });
  };

  const init = () => {
    const savedStore = JSON.parse(localStorage.getItem(STORAGE_KEYS.selectedStore) || 'null');

    if (savedStore) {
      updateLocationLabels(savedStore);
    }

    initStoreSelector();
    initCheckoutGuard();
  };

  document.addEventListener('DOMContentLoaded', init);
})();
