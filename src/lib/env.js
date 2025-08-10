const MODE =
    (import.meta.env.VITE_MODE ?? import.meta.env.MODE ?? 'development')
        .toString()
        .toLowerCase();

export function isDev() {
    return MODE === 'development';
}

export function isProd() {
    return MODE === 'production';
}
