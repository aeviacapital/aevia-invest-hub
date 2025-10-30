import { useEffect } from 'react';

// Extend Window interface to include Brevo properties
declare global {
  interface Window {
    BrevoConversationsID?: string;
    BrevoConversations?: any;
  }
}

const BrevoConversations = () => {
  useEffect(() => {
    (function(d, w, c) {
      w.BrevoConversationsID = '69039600841f0533e0028d57';
      w[c] = w[c] || function() {
        (w[c].q = w[c].q || []).push(arguments);
      };
      const s = d.createElement('script');
      s.async = true;
      s.src = 'https://conversations-widget.brevo.com/brevo-conversations.js';
      if (d.head) d.head.appendChild(s);
    })(document, window, 'BrevoConversations');
  }, []);

  return null; // Since the widget is external, no JSX is needed to render within this component.
};
export default BrevoConversations;

