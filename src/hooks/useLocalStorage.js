import { useEffect, useState } from "react";

// Un pequeño hook propio que nos facilita el acceso al localStorage
// Mantiene una parte pequeña del estado entre recargas sin necesitar backend.
// El valor puede seguir actualizándose exactamente igual que con useState.
// Evita que tengamos que repetir los cmds para usar LocalStorage en cada uno de nuestras entidades (usuarios, cuentas, sesion, gremios, etc)

// Params: Clave identifica el dato dentro del navegador y el valor sirve como respaldo si todavia no existe nada guardado.
function useLocalStorage(clave, valorInicial) {
  const [valor, setValor] = useState(() => {
    try {
      const guardado = window.localStorage.getItem(clave);
      return guardado ? JSON.parse(guardado) : valorInicial;
      // si esta guardado, hazle el parse (castealo de nuevo a objeto), sino, dame valorInicial
    } catch {
      return valorInicial;
    }
  });

  // Cada vez que cambia el valor o la clave, se guarda una copia en el navegador (Local Storage).
  useEffect(() => {
    window.localStorage.setItem(clave, JSON.stringify(valor));
  }, [clave, valor]);

  return [valor, setValor];
}

export default useLocalStorage;
