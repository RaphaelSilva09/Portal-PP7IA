import { describe, expect, it } from "vitest";
import { classifyDeviceCategory } from "@/lib/deviceCategory";

const UA = {
    iphone:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
    androidPhone:
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    androidTablet:
        "Mozilla/5.0 (Linux; Android 14; SM-X200) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    windowsDesktop:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    macDesktop:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    ipadModern:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    windowsPhone: "Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; Microsoft; Lumia 950) like Gecko",
};

describe("classifyDeviceCategory", () => {
    it("classifica iPhone como mobile", () => {
        expect(classifyDeviceCategory(UA.iphone)).toBe("mobile");
    });

    it("classifica Android phone (UA com 'Mobile') como mobile", () => {
        expect(classifyDeviceCategory(UA.androidPhone)).toBe("mobile");
    });

    it("classifica Windows Phone como mobile", () => {
        expect(classifyDeviceCategory(UA.windowsPhone)).toBe("mobile");
    });

    it("classifica Android tablet (UA sem 'Mobile') como non_mobile", () => {
        expect(classifyDeviceCategory(UA.androidTablet)).toBe("non_mobile");
    });

    it("classifica desktop Windows como non_mobile", () => {
        expect(classifyDeviceCategory(UA.windowsDesktop)).toBe("non_mobile");
    });

    it("classifica desktop Mac como non_mobile", () => {
        expect(classifyDeviceCategory(UA.macDesktop)).toBe("non_mobile");
    });

    it("classifica iPad moderno (UA de Macintosh) como non_mobile — ambiguidade aceita", () => {
        expect(classifyDeviceCategory(UA.ipadModern)).toBe("non_mobile");
    });

    it("sem User-Agent, assume non_mobile", () => {
        expect(classifyDeviceCategory(null)).toBe("non_mobile");
        expect(classifyDeviceCategory(undefined)).toBe("non_mobile");
        expect(classifyDeviceCategory("")).toBe("non_mobile");
    });
});
