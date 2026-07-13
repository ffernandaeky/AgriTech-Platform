declare module 'jsvectormap' {
    interface JsVectorMapOptions {
        selector: string | HTMLElement;
        map?: string;
        [key: string]: unknown;
    }

    class jsVectorMap {
        constructor(options: JsVectorMapOptions);
        destroy(): void;
        [key: string]: unknown;
    }

    export default jsVectorMap;
}