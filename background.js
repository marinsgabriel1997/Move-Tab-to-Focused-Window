// Variável para armazenar informações da janela focada
let focusedWindowInfo = {
  id: null,
  width: null,
  height: null,
  top: null,
  left: null,
};

// Atualiza as informações da janela focada
const updateFocusedWindow = () => {
  chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
    if (chrome.runtime.lastError) {
      return;
    }
    focusedWindowInfo = {
      id: currentWindow.id,
      width: currentWindow.width,
      height: currentWindow.height,
      top: currentWindow.top,
      left: currentWindow.left,
    };
  });
};

// Evento disparado quando o foco da janela é alterado
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    chrome.windows.get(windowId, { populate: true }, (currentWindow) => {
      if (chrome.runtime.lastError) {
        return;
      }
      focusedWindowInfo = {
        id: currentWindow.id,
        width: currentWindow.width,
        height: currentWindow.height,
        top: currentWindow.top,
        left: currentWindow.left,
      };
    });
  }
});

// Evento disparado quando uma nova aba é criada
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.windowId !== focusedWindowInfo.id) {
    // Ajusta o tamanho e a posição da nova janela antes de mover a aba
    chrome.windows.update(
      tab.windowId,
      {
        width: focusedWindowInfo.width,
        height: focusedWindowInfo.height,
        top: focusedWindowInfo.top,
        left: focusedWindowInfo.left,
      },
      () => {
        if (chrome.runtime.lastError) {
          return;
        }

        // Move a aba para a janela focada
        chrome.tabs.move(tab.id, { windowId: focusedWindowInfo.id, index: -1 }, (movedTab) => {
          if (chrome.runtime.lastError) {
            return;
          }

          // Após mover a aba, ativa (foca) a aba na janela focada
          chrome.tabs.update(tab.id, { active: true }, () => {
            if (chrome.runtime.lastError) {
              return;
            }
          });
        });
      }
    );
  }
});

// Inicializa as informações da janela focada ao iniciar a extensão
const install = async () => {
  updateFocusedWindow();
  chrome.windows.onFocusChanged.addListener(updateFocusedWindow);
};

// Chama a função de instalação quando a extensão for iniciada
chrome.runtime.onInstalled.addListener(install);
chrome.runtime.onStartup.addListener(install);
