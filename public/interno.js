// Tráfico propio. Va en <head>, antes de la etiqueta de Google Analytics.
//
// Un dispositivo se marca como propio abriendo una vez /?interno=1 (y se
// desmarca con /?interno=0). En los dispositivos marcados se le avisa a
// Google Analytics con traffic_type=internal, que es lo que usa su filtro de
// "tráfico interno", y el contador propio del sitio no los cuenta.
// La marca vive solo en ese navegador (localStorage); no identifica a nadie.
(function () {
  try {
    var pedido = /[?&]interno=([01])(&|$)/.exec(location.search);
    if (pedido) {
      if (pedido[1] === "1") localStorage.setItem("salehoy-interno", "1");
      else localStorage.removeItem("salehoy-interno");
    }
    if (localStorage.getItem("salehoy-interno") === "1") {
      window.SaleHoyInterno = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      window.gtag("set", { traffic_type: "internal" });
    }
  } catch (e) {}
})();
