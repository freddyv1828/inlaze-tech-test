// Backoff Exponencial

/**
 * Esta es una funcion de utilidad para ejecutar reintentos 
 * @param fn - Esta es la funcion que se va a ajecutar
 * @param retries - Este eseria el numero maximo de intentos
 * @param delay - Tiempo de espera inicial esta en milisegundos
 */

export async function retriWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
): Promise<T> {

    try {
        // Intenti de ejecucion de la funcion
        return await fn();
    } catch (error) {
        // Si no quedan mas intentos, lanzamos el error
        if (retries <= 0) {
            throw error;
            
        }
        console.warn(`⚠️ Error detectado. Reintentando en ${delay}ms... (Intentos restantes: ${retries})`);

        // Esperamos el tiempo actual del delay
        await new Promise(resolve => setTimeout(resolve, delay));

        // Recursividad llamando la funcion, multiplicamos el delay x2
        return retriWithBackoff(fn, retries -1, delay *2);
    }
    
}