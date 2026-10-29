import React, { ReactElement } from 'react'
import { Portal, Tooltip } from '@chakra-ui/react'

interface TipProps {
    label: string
    children: ReactElement
}

export function Tip({ label, children }: TipProps) {
    return (
        <Tooltip.Root openDelay={300} closeDelay={100}>
            <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
            <Portal>
                <Tooltip.Positioner>
                    <Tooltip.Content>{label}</Tooltip.Content>
                </Tooltip.Positioner>
            </Portal>
        </Tooltip.Root>
    )
}
