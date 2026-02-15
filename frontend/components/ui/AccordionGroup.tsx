"use client";

import { Children, cloneElement, isValidElement, ReactElement, ReactNode, useState } from "react";
import { AccordionProps } from "./Accordion";

/**
 * AccordionGroup Component
 *
 * Gerencia estado de múltiplos accordions filhos com controle de abertura exclusiva.
 * Segue SRP: responsável apenas por coordenar estado de abertura entre accordions.
 *
 * Princípios aplicados:
 * - SRP: Coordenação de estado, não renderização visual
 * - Controlled Component Pattern: Injeta props nos filhos via cloneElement
 * - Separation of Concerns: Estado separado da apresentação
 */

export interface AccordionGroupProps {
    /** Elementos Accordion filhos */
    children: ReactNode;
    /** Permite múltiplos accordions abertos simultaneamente (padrão: false = exclusivo) */
    allowMultiple?: boolean;
}

export function AccordionGroup({ children, allowMultiple = false }: AccordionGroupProps) {
    const [openIds, setOpenIds] = useState<string[]>([]);

    /**
     * Handler para toggle de accordion
     * Se allowMultiple=false, fecha outros accordions no mesmo nível
     */
    const handleToggle = (id: string) => {
        setOpenIds((prev) => {
            const isCurrentlyOpen = prev.includes(id);

            if (allowMultiple) {
                // Modo múltiplo: toggle individual
                return isCurrentlyOpen ? prev.filter((openId) => openId !== id) : [...prev, id];
            } else {
                // Modo exclusivo: fecha irmãos, abre/fecha o clicado
                return isCurrentlyOpen ? [] : [id];
            }
        });
    };

    /**
     * Injeta props isOpen e onToggle nos filhos Accordion
     * Preserva outros props e componentes que não são Accordion
     */
    const childrenWithProps = Children.map(children, (child) => {
        if (isValidElement(child) && typeof child.type !== "string") {
            // Type assertion para acessar props do Accordion
            const accordionChild = child as ReactElement<AccordionProps>;

            // Se o filho tem um id (é um Accordion), injeta as props de controle
            if (accordionChild.props.id) {
                return cloneElement(accordionChild, {
                    isOpen: openIds.includes(accordionChild.props.id),
                    onToggle: handleToggle,
                });
            }
        }
        return child;
    });

    return <div className="space-y-0">{childrenWithProps}</div>;
}
