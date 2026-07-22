import { lazy, type ComponentType } from 'react';

const RELOAD_FLAG = 'chunk-reload-attempted';

/**
 * React.lazy dengan auto-reload sekali saat chunk gagal dimuat.
 *
 * Setelah deploy baru, hash chunk berubah dan chunk lama tidak ada lagi di
 * server — tab yang masih memuat index.html lama akan gagal dynamic import
 * (server mengembalikan index.html sebagai SPA fallback → error MIME text/html).
 * Full reload mengambil index.html terbaru dengan referensi chunk yang benar.
 *
 * Flag di sessionStorage mencegah reload loop kalau kegagalannya bukan karena
 * deploy (mis. jaringan mati) — percobaan kedua melempar error apa adanya.
 */
export function lazyWithReload(importer: () => Promise<{ default: ComponentType }>) {
  return lazy(async () => {
    try {
      const module = await importer();
      sessionStorage.removeItem(RELOAD_FLAG);
      return module;
    } catch (error) {
      if (!sessionStorage.getItem(RELOAD_FLAG)) {
        sessionStorage.setItem(RELOAD_FLAG, '1');
        window.location.reload();
        // Halaman sedang reload — jangan resolve supaya Suspense tetap menampilkan fallback
        return new Promise<{ default: ComponentType }>(() => {});
      }
      throw error;
    }
  });
}
