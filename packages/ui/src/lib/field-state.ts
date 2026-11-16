"use client"

import { createContext } from "react"
import type { Field } from "@base-ui/react/field"

export const FieldStateContext = createContext<Field.Root.State | null>(null)
