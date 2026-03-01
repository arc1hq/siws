'use client'

import { cn } from '@ui/lib/utils'
import { useMounted } from '@ui/hooks/use-mounted'
import type { LucideIcon } from 'lucide-react'
import { Hash, ListTree, Text } from 'lucide-react'
import { motion, useSpring } from 'motion/react'
import type { RefObject } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

interface TocEntry {
  items?: TocEntry[]
  url: string
  title: string
}

type TocSizeVariant = 'sm' | 'md' | 'lg'
type TocMarkerVariant = 'auto' | 'number' | 'dot' | 'none'
type TocIconVariant = 'text' | 'hash' | 'tree' | 'none'

interface TocProps {
  toc: TocEntry[]
  size?: TocSizeVariant
  markerVariant?: TocMarkerVariant
  iconVariant?: TocIconVariant
  maxDepth?: number
  title?: string
  className?: string
}

type TocNodeMetric = {
  id: string
  center: number
  level: number
  left: number
}

type ResolvedTocMarkerVariant = Exclude<TocMarkerVariant, 'auto'>

type TocSizeConfig = {
  headingIcon: string
  headingText: string
  listText: string
  nestedIndent: string
  rowPadY: string
  itemGap: string
  lineStroke: number
  progressStroke: number
  markerNumberSize: string
  markerNumberText: string
  markerDotSize: string
  cornerRadius: number
  activePadding: Record<ResolvedTocMarkerVariant, number>
  pathPadding: Record<ResolvedTocMarkerVariant, number>
}

const TOC_SIZE_CONFIG: Record<TocSizeVariant, TocSizeConfig> = {
  sm: {
    headingIcon: 'size-3.5',
    headingText: 'text-sm',
    listText: 'text-xs',
    nestedIndent: 'pl-5',
    rowPadY: 'py-1',
    itemGap: 'gap-1.5',
    lineStroke: 1.75,
    progressStroke: 1.1,
    markerNumberSize: 'size-4',
    markerNumberText: 'text-[9px]',
    markerDotSize: 'h-2 w-2',
    cornerRadius: 10,
    activePadding: { number: 8, dot: 5, none: 12 },
    pathPadding: { number: 0, dot: 0, none: 6 }
  },
  md: {
    headingIcon: 'size-4',
    headingText: 'text-base',
    listText: 'text-sm',
    nestedIndent: 'pl-6',
    rowPadY: 'py-1.5',
    itemGap: 'gap-2',
    lineStroke: 2,
    progressStroke: 1.25,
    markerNumberSize: 'size-5',
    markerNumberText: 'text-[10px]',
    markerDotSize: 'h-2.5 w-2.5',
    cornerRadius: 14,
    activePadding: { number: 10, dot: 6, none: 14 },
    pathPadding: { number: 0, dot: 0, none: 8 }
  },
  lg: {
    headingIcon: 'size-4.5',
    headingText: 'text-base',
    listText: 'text-base',
    nestedIndent: 'pl-7',
    rowPadY: 'py-2',
    itemGap: 'gap-2.5',
    lineStroke: 2.25,
    progressStroke: 1.4,
    markerNumberSize: 'size-6',
    markerNumberText: 'text-xs',
    markerDotSize: 'h-3 w-3',
    cornerRadius: 16,
    activePadding: { number: 12, dot: 7, none: 16 },
    pathPadding: { number: 0, dot: 0, none: 10 }
  }
}

function resolveMarkerVariant(
  markerVariant: TocMarkerVariant | undefined
): ResolvedTocMarkerVariant {
  if (!markerVariant || markerVariant === 'auto') {
    return 'none'
  }
  return markerVariant
}

function getHeadingIcon(iconVariant: TocIconVariant): LucideIcon | null {
  if (iconVariant === 'none') return null
  if (iconVariant === 'hash') return Hash
  if (iconVariant === 'tree') return ListTree
  return Text
}

function collectItemIds(items: TocEntry[]): string[] {
  return items.flatMap((item) => {
    const id = item.url.split('#')[1]
    const nested = item.items ? collectItemIds(item.items) : []
    return id ? [id, ...nested] : nested
  })
}

function getNodeMetrics(
  contentElement: HTMLDivElement,
  nodesRef: RefObject<Map<string, HTMLElement>>
) {
  const contentRect = contentElement.getBoundingClientRect()

  return Array.from(nodesRef.current.entries())
    .map(([id, element]) => {
      const rect = element.getBoundingClientRect()
      const anchor = element.querySelector<HTMLElement>('[data-toc-line-anchor]')
      const anchorRect = anchor?.getBoundingClientRect()

      return {
        id,
        center: rect.top - contentRect.top + rect.height / 2,
        level: Number.parseInt(element.getAttribute('data-level') || '1', 10),
        left:
          anchorRect !== undefined
            ? anchorRect.left - contentRect.left + anchorRect.width / 2
            : rect.left - contentRect.left
      }
    })
    .sort((a, b) => a.center - b.center)
}

function buildLevelXMap(metrics: TocNodeMetric[]) {
  const xByLevel = new Map<number, number>()

  for (const metric of metrics) {
    if (!xByLevel.has(metric.level)) {
      xByLevel.set(metric.level, metric.left)
    }
  }

  if (!xByLevel.has(1)) {
    xByLevel.set(1, 0)
  }

  const level1X = xByLevel.get(1) ?? 0
  const level2X = xByLevel.get(2)
  const fallbackStep = level2X !== undefined ? level2X - level1X : 24
  const maxLevel = Math.max(...Array.from(xByLevel.keys()), 1)

  for (let level = 2; level <= maxLevel; level++) {
    if (!xByLevel.has(level)) {
      xByLevel.set(level, level1X + fallbackStep * (level - 1))
    }
  }

  return xByLevel
}

function buildTocPath(
  metrics: TocNodeMetric[],
  cornerRadius: number,
  startExtension = 0,
  endExtension = 0
) {
  const first = metrics[0]
  if (!first) return 'M 0 0'

  const xByLevel = buildLevelXMap(metrics)
  const firstX = xByLevel.get(first.level) ?? 0
  let path = `M ${firstX} ${first.center - startExtension}`
  path += ` L ${firstX} ${first.center}`

  for (let i = 1; i < metrics.length; i++) {
    const previous = metrics[i - 1]
    const current = metrics[i]
    if (!previous || !current) continue

    const previousX = xByLevel.get(previous.level) ?? 0
    const currentX = xByLevel.get(current.level) ?? 0
    const midY = (previous.center + current.center) / 2

    if (previousX === currentX) {
      path += ` L ${currentX} ${current.center}`
      continue
    }

    const horizontalDistance = Math.abs(currentX - previousX)
    const verticalDistance = current.center - previous.center
    const radius = Math.min(cornerRadius, horizontalDistance / 2, verticalDistance / 2)
    const directionX = Math.sign(currentX - previousX)

    if (radius <= 0) {
      path += ` L ${previousX} ${midY}`
      path += ` L ${currentX} ${midY}`
      path += ` L ${currentX} ${current.center}`
      continue
    }

    const firstTurnY = midY - radius
    const secondTurnY = midY + radius
    const firstCornerEndX = previousX + directionX * radius
    const secondCornerStartX = currentX - directionX * radius

    path += ` L ${previousX} ${firstTurnY}`
    path += ` Q ${previousX} ${midY} ${firstCornerEndX} ${midY}`
    path += ` L ${secondCornerStartX} ${midY}`
    path += ` Q ${currentX} ${midY} ${currentX} ${secondTurnY}`
    path += ` L ${currentX} ${current.center}`
  }

  const last = metrics[metrics.length - 1]
  if (last && endExtension > 0) {
    const lastX = xByLevel.get(last.level) ?? 0
    path += ` L ${lastX} ${last.center + endExtension}`
  }

  return path
}

function TocHeader({
  title,
  iconVariant,
  config
}: {
  title: string
  iconVariant: TocIconVariant
  config: TocSizeConfig
}) {
  const Icon = getHeadingIcon(iconVariant)

  return (
    <div className={cn('flex items-center gap-2', config.headingText)}>
      {Icon ? <Icon className={config.headingIcon} /> : null}
      <p className="font-medium">{title}</p>
    </div>
  )
}

function TocRail({
  svgPath,
  y1,
  y2,
  config
}: {
  svgPath: string
  y1: ReturnType<typeof useSpring>
  y2: ReturnType<typeof useSpring>
  config: TocSizeConfig
}) {
  return (
    <motion.svg className="pointer-events-none absolute h-full overflow-visible z-10">
      <path
        d={svgPath}
        fill="none"
        stroke="var(--border)"
        strokeWidth={config.lineStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.path
        id="progress"
        d={svgPath}
        fill="none"
        stroke="url(#gradient)"
        strokeWidth={config.progressStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        transition={{
          duration: 0.3,
          type: 'spring',
          bounce: 0
        }}
      />
      <defs>
        <motion.linearGradient
          id="gradient"
          gradientUnits="userSpaceOnUse"
          x1="0"
          x2="0"
          y1={y1}
          y2={y2}
        >
          <stop stopColor="var(--foreground)" stopOpacity="0"></stop>
          <stop stopColor="var(--foreground)"></stop>
          <stop offset="1" stopColor="var(--foreground)"></stop>
          <stop offset="1" stopColor="var(--foreground)" stopOpacity="0"></stop>
        </motion.linearGradient>
      </defs>
    </motion.svg>
  )
}

export function TableOfContents({
  toc,
  size = 'md',
  markerVariant = 'auto',
  iconVariant = 'text',
  maxDepth = 2,
  title = 'On this page',
  className
}: TocProps) {
  const resolvedMarkerVariant = resolveMarkerVariant(markerVariant)
  const config = TOC_SIZE_CONFIG[size]
  const layoutVersion = `${resolvedMarkerVariant}:${maxDepth}:${size}`

  const itemIds = useMemo(() => collectItemIds(toc), [toc])
  const activeHeadings = useActiveItems(itemIds)
  const mounted = useMounted()

  const contentRef = useRef<HTMLDivElement>(null)
  const nodesRef = useRef<Map<string, HTMLElement>>(new Map())
  const metricsRef = useRef<TocNodeMetric[]>([])
  const [isNearPageBottom, setIsNearPageBottom] = useState(false)
  const [svgPath, setSvgPath] = useState('M 1 0 L 1 0')

  const y1 = useSpring(0, {
    stiffness: 300,
    damping: 30,
    bounce: 0,
    duration: 0.3
  })

  const y2 = useSpring(0, {
    stiffness: 300,
    damping: 30,
    bounce: 0,
    duration: 0.3
  })

  useEffect(() => {
    if (!mounted || !contentRef.current || toc.length === 0 || layoutVersion.length === 0) return

    const updateMetrics = () => {
      if (!contentRef.current) return
      const metrics = getNodeMetrics(contentRef.current, nodesRef)
      metricsRef.current = metrics
      const padding = config.pathPadding[resolvedMarkerVariant]
      setSvgPath(buildTocPath(metrics, config.cornerRadius, padding, padding))
    }

    updateMetrics()

    const resizeObserver = new ResizeObserver(updateMetrics)
    resizeObserver.observe(contentRef.current)
    window.addEventListener('resize', updateMetrics)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateMetrics)
    }
  }, [toc, mounted, layoutVersion, config.cornerRadius, config.pathPadding, resolvedMarkerVariant])

  useEffect(() => {
    const updateScrollPosition = () => {
      const maxScrollY = document.documentElement.scrollHeight - window.innerHeight

      if (maxScrollY <= 0) {
        setIsNearPageBottom(false)
        return
      }

      const remaining = maxScrollY - window.scrollY
      setIsNearPageBottom(window.scrollY > 0 && remaining <= 4)
    }

    updateScrollPosition()
    window.addEventListener('scroll', updateScrollPosition, { passive: true })
    window.addEventListener('resize', updateScrollPosition)

    return () => {
      window.removeEventListener('scroll', updateScrollPosition)
      window.removeEventListener('resize', updateScrollPosition)
    }
  }, [])

  useEffect(() => {
    const metrics = metricsRef.current
    if (metrics.length === 0 || activeHeadings.length === 0) return

    const activeSet = new Set(activeHeadings)
    const activeMetrics = metrics.filter((metric) => activeSet.has(metric.id))
    if (activeMetrics.length === 0) return

    const first = activeMetrics[0]
    const activeLast = activeMetrics[activeMetrics.length - 1]
    const metricLast = metrics[metrics.length - 1]
    const last = isNearPageBottom ? (metricLast ?? activeLast) : activeLast
    if (!first || !last) return

    const padding = config.activePadding[resolvedMarkerVariant]
    y1.set(first.center - padding)
    y2.set(last.center + padding)
  }, [activeHeadings, config.activePadding, isNearPageBottom, resolvedMarkerVariant, y1, y2])

  return (
    <div className={cn('space-y-4', className)}>
      <TocHeader title={title} iconVariant={iconVariant} config={config} />
      <div className="relative" ref={contentRef}>
        {mounted ? <TocRail svgPath={svgPath} y1={y1} y2={y2} config={config} /> : null}
        <TocTree
          tree={toc}
          activeItems={activeHeadings}
          nodesRef={nodesRef}
          markerVariant={resolvedMarkerVariant}
          sizeConfig={config}
          maxDepth={maxDepth}
        />
      </div>
    </div>
  )
}

function useActiveItems(itemIds: string[]) {
  const [activeIds, setActiveIds] = useState<string[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveIds((prev) =>
              prev.includes(entry.target.id) ? prev : [...prev, entry.target.id]
            )
          } else {
            setActiveIds((prev) => prev.filter((id) => id !== entry.target.id))
          }
        })
      },
      { rootMargin: `0% 0% -50% 0%` }
    )

    itemIds?.forEach((id) => {
      if (!id) {
        return
      }

      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      itemIds?.forEach((id) => {
        if (!id) {
          return
        }

        const element = document.getElementById(id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [itemIds])

  return activeIds
}

interface TreeProps {
  tree: TocEntry[]
  level?: number
  activeItems?: string[]
  nodesRef: { current: Map<string, HTMLElement> }
  markerVariant: ResolvedTocMarkerVariant
  sizeConfig: TocSizeConfig
  maxDepth: number
  parentIndex?: number
}

function TocTree({
  tree,
  level = 1,
  activeItems = [],
  nodesRef,
  markerVariant,
  sizeConfig,
  maxDepth,
  parentIndex
}: TreeProps) {
  const getIndexMarker = (index: number, level: number) => {
    if (level === 1) return `${index + 1}`
    if (level === 2) return `${(parentIndex ?? 0) + 1}.${String.fromCharCode(97 + index)}`
    return `${index + 1}`
  }

  return tree.length > 0 && level <= maxDepth ? (
    <ul
      className={cn(
        'm-0 list-none relative',
        sizeConfig.listText,
        level !== 1 && sizeConfig.nestedIndent,
        level !== 1 && 'pt-3'
      )}
    >
      {tree.map((item, index) => {
        const id = item.url.split('#')[1] ?? ''
        const isActive = id !== '' && activeItems.includes(id)
        const indexMarker = getIndexMarker(index, level)

        return (
          <li key={item.url} className={cn('mt-0 relative', index !== 0 && 'pt-3')}>
            <div
              className={cn(
                'group flex items-center cursor-pointer',
                sizeConfig.itemGap,
                sizeConfig.rowPadY
              )}
              ref={(el) => {
                if (el) {
                  nodesRef.current.set(id, el)
                  el.setAttribute('data-level', level.toString())
                } else nodesRef.current.delete(id)
              }}
              data-level={level}
            >
              <TocMarker
                markerVariant={markerVariant}
                sizeConfig={sizeConfig}
                isActive={isActive}
                indexMarker={indexMarker}
              />
              <a
                href={item.url}
                className={cn(
                  'inline-block no-underline px-1 rounded leading-none transition-colors duration-200',
                  isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                )}
              >
                {item.title}
              </a>
            </div>
            {item.items?.length ? (
              <TocTree
                tree={item.items}
                level={level + 1}
                activeItems={activeItems}
                nodesRef={nodesRef}
                markerVariant={markerVariant}
                sizeConfig={sizeConfig}
                maxDepth={maxDepth}
                parentIndex={index}
              />
            ) : null}
          </li>
        )
      })}
    </ul>
  ) : null
}

function TocMarker({
  markerVariant,
  sizeConfig,
  isActive,
  indexMarker
}: {
  markerVariant: ResolvedTocMarkerVariant
  sizeConfig: TocSizeConfig
  isActive: boolean
  indexMarker: string
}) {
  if (markerVariant === 'none') {
    return <span data-toc-line-anchor className="h-0 w-0 shrink-0" />
  }

  if (markerVariant === 'dot') {
    return (
      <span
        data-toc-line-anchor
        className={cn(
          'relative z-20 inline-flex items-center justify-center shrink-0 rounded-full transition-all duration-300 ease-in-out',
          sizeConfig.markerDotSize,
          isActive ? 'bg-foreground shadow' : 'bg-muted-foreground/45 group-hover:bg-foreground/70'
        )}
      />
    )
  }

  return (
    <span
      data-toc-line-anchor
      className={cn(
        'relative z-20 flex items-center justify-center shrink-0 rounded-full leading-none tabular-nums transition-all duration-300 ease-in-out shadow select-none group-hover:scale-110 group-hover:shadow-md',
        sizeConfig.markerNumberSize,
        sizeConfig.markerNumberText,
        isActive
          ? 'bg-foreground text-background'
          : 'bg-muted text-muted-foreground group-hover:bg-foreground group-hover:text-background'
      )}
    >
      {indexMarker}
    </span>
  )
}
