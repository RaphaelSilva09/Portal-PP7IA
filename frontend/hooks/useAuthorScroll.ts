import { useState, useEffect, useCallback, RefObject } from "react";

interface SectionPosition {
    top: number;
    bottom: number;
    id: string;
}

interface UseAuthorScrollReturn {
    scrollProgress: number;
    activeSectionIndex: number;
    sectionPositions: SectionPosition[];
    sectionOpacities: number[];
}

export function useAuthorScroll(
    containerRef: RefObject<HTMLDivElement | null>,
    sectionRefs: RefObject<(HTMLElement | null)[]>,
    sectionsCount: number
): UseAuthorScrollReturn {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [activeSectionIndex, setActiveSectionIndex] = useState(0);
    const [sectionPositions, setSectionPositions] = useState<SectionPosition[]>([]);
    const [sectionOpacities, setSectionOpacities] = useState<number[]>([]);

    // Update section positions relative to container
    const updatePositions = useCallback(() => {
        if (!containerRef.current || !sectionRefs.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerTop = containerRect.top + window.scrollY;

        const positions = sectionRefs.current.map((ref, index) => {
            if (!ref) return { top: 0, bottom: 0, id: `section-${index}` };
            
            const rect = ref.getBoundingClientRect();
            return {
                top: rect.top + window.scrollY - containerTop,
                bottom: rect.bottom + window.scrollY - containerTop,
                id: ref.id || `section-${index}`,
            };
        });

        setSectionPositions(positions);
    }, [containerRef, sectionRefs]);

    // Calculate scroll progress within container
    const calculateScrollProgress = useCallback(() => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerHeight = containerRect.height;
        const viewportHeight = window.innerHeight;

        // Calculate how much of the container has scrolled past viewport top
        const scrolled = -containerRect.top;
        const maxScroll = containerHeight - viewportHeight;

        const progress = maxScroll > 0 ? Math.max(0, Math.min(1, scrolled / maxScroll)) : 0;
        setScrollProgress(progress);
    }, [containerRef]);

    // Determine active section based on viewport middle
    const determineActiveSection = useCallback(() => {
        if (!containerRef.current || sectionPositions.length === 0) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Find which section is closest to middle of viewport (relative to container)
        const viewportMiddle = window.innerHeight * 0.5;
        const relativeMiddle = viewportMiddle - containerRect.top;

        let newActiveIndex = 0;
        let minDistance = Infinity;

        sectionPositions.forEach((pos, index) => {
            const sectionMiddle = (pos.top + pos.bottom) / 2;
            const distance = Math.abs(sectionMiddle - relativeMiddle);

            if (distance < minDistance) {
                minDistance = distance;
                newActiveIndex = index;
            }
        });

        setActiveSectionIndex(newActiveIndex);
    }, [containerRef, sectionPositions]);

    // Calculate opacity for each section based on viewport position
    const calculateSectionOpacities = useCallback(() => {
        if (!sectionRefs.current) return;

        const viewportHeight = window.innerHeight;
        
        // Fade zones (baseado na altura do viewport)
        const fadeInStart = viewportHeight * 0.8;  // 80% - Começa fade-in
        const fadeInEnd = viewportHeight * 0.5;    // 50% - Opacidade total
        const fadeOutStart = viewportHeight * 0.3; // 30% - Começa fade-out
        const fadeOutEnd = 0;                       // 0% - Completamente transparente

        const opacities = sectionRefs.current.map((ref) => {
            if (!ref) return 0;

            const rect = ref.getBoundingClientRect();
            const sectionMiddle = rect.top + rect.height / 2;

            // Seção abaixo da tela (ainda não entrou)
            if (sectionMiddle > fadeInStart) {
                return 0.3; // Opacidade mínima
            }

            // Fade-in (entrando de baixo)
            if (sectionMiddle > fadeInEnd) {
                const progress = (fadeInStart - sectionMiddle) / (fadeInStart - fadeInEnd);
                return 0.3 + (progress * 0.7); // De 0.3 a 1.0
            }

            // Fade-out (saindo por cima)
            if (sectionMiddle < fadeOutEnd) {
                return 0; // Completamente transparente
            }

            if (sectionMiddle < fadeOutStart) {
                const progress = sectionMiddle / fadeOutStart;
                return 0.3 + (progress * 0.7); // De 0.3 a 1.0
            }

            // No meio da tela - opacidade total
            return 1.0;
        });

        setSectionOpacities(opacities);
    }, [sectionRefs]);

    // Scroll handler - no snap, just visual effects
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    calculateScrollProgress();
                    determineActiveSection();
                    calculateSectionOpacities();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        
        // Initial calculation
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [calculateScrollProgress, determineActiveSection, calculateSectionOpacities]);

    // Update positions on mount and resize
    useEffect(() => {
        updatePositions();
        calculateSectionOpacities();
        
        const handleResize = () => {
            updatePositions();
            calculateSectionOpacities();
        };

        window.addEventListener("resize", handleResize);
        
        // Small delay to ensure all DOM elements are rendered
        const timeoutId = setTimeout(() => {
            updatePositions();
            calculateSectionOpacities();
        }, 100);

        return () => {
            window.removeEventListener("resize", handleResize);
            clearTimeout(timeoutId);
        };
    }, [updatePositions, calculateSectionOpacities, sectionsCount]);

    return {
        scrollProgress,
        activeSectionIndex,
        sectionPositions,
        sectionOpacities,
    };
}
