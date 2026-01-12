import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

/** * IMPORTANTE: O index.css contém as diretivas do Tailwind e as variáveis 
 * de cor da DDM. Deve ser importado aqui para que os estilos carreguem 
 * antes de qualquer componente.
 */
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);