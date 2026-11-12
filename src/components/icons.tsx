"use client"

import * as React from "react"
import * as Phosphor from "@phosphor-icons/react"

type IconProps = React.ComponentProps<"svg"> & {
  color?: string
  size?: number | string
  weight?: string
  mirrored?: boolean
}

const icon = (name: string) => {
  const Icon = (Phosphor as unknown as Record<string, React.ComponentType<IconProps>>)[name]
    ?? (Phosphor as unknown as Record<string, React.ComponentType<IconProps>>).CircleIcon
  return function SharedIcon(props: IconProps) {
    return <Icon weight="regular" size={20} {...props} />
  }
}

export const Activity = icon("ActivityIcon")
export const AlertCircle = icon("WarningCircleIcon")
export const AlertTriangle = icon("WarningIcon")
export const ArrowDownLeft = icon("ArrowDownLeftIcon")
export const ArrowDownRight = icon("ArrowDownRightIcon")
export const ArrowDownToLine = icon("ArrowDownIcon")
export const ArrowLeft = icon("ArrowLeftIcon")
export const ArrowRight = icon("ArrowRightIcon")
export const ArrowUpRight = icon("ArrowUpRightIcon")
export const ArrowsClockwise = icon("ArrowsClockwiseIcon")
export const BarChart3 = icon("ChartBarIcon")
export const Bank = icon("BankIcon")
export const Banknote = icon("MoneyIcon")
export const Bell = icon("BellIcon")
export const Building2 = icon("BuildingsIcon")
export const Calendar = icon("CalendarIcon")
export const Check = icon("CheckIcon")
export const CheckCircle = icon("CheckCircleIcon")
export const CheckCircle2 = CheckCircle
export const ChevronDown = icon("CaretDownIcon")
export const ChevronLeft = icon("CaretLeftIcon")
export const ChevronRight = icon("CaretRightIcon")
export const ChevronUp = icon("CaretUpIcon")
export const CircleAlert = AlertCircle
export const CircleCheck = CheckCircle
export const Clock = icon("ClockIcon")
export const Clock3 = Clock
export const Copy = icon("CopyIcon")
export const CreditCard = icon("CreditCardIcon")
export const Cpu = icon("CpuIcon")
export const Eye = icon("EyeIcon")
export const EyeOff = icon("EyeSlashIcon")
export const ExternalLink = icon("ArrowUpRightIcon")
export const FileText = icon("FileTextIcon")
export const FilterX = icon("FunnelIcon")
export const Gear = icon("GearIcon")
export const Hash = icon("HashIcon")
export const Key = icon("KeyIcon")
export const KeyRound = Key
export const Landmark = Bank
export const LayoutDashboard = icon("SquaresFourIcon")
export const Link = icon("LinkIcon")
export const LinkIcon = Link
export const ListOrdered = icon("ListNumbersIcon")
export const LoaderCircle = icon("CircleNotchIcon")
export const Lock = icon("LockIcon")
export const LockKeyhole = icon("KeyholeIcon")
export const LogOut = icon("SignOutIcon")
export const Mail = icon("EnvelopeIcon")
export const Menu = icon("ListIcon")
export const MonitorSmartphone = icon("DeviceMobileIcon")
export const Network = icon("NetworkIcon")
export const Plus = icon("PlusIcon")
export const Power = icon("PowerIcon")
export const PowerOff = Power
export const Receipt = icon("ReceiptIcon")
export const RefreshCw = ArrowsClockwise
export const RotateCcw = icon("ArrowCounterClockwiseIcon")
export const Save = icon("FloppyDiskIcon")
export const Search = icon("MagnifyingGlassIcon")
export const Send = icon("PaperPlaneTiltIcon")
export const Server = icon("DesktopIcon")
export const ServerCrash = Server
export const Settings = Gear
export const Shield = icon("ShieldIcon")
export const ShieldAlert = icon("ShieldWarningIcon")
export const ShieldBan = ShieldAlert
export const ShieldCheck = icon("ShieldCheckIcon")
export const SlidersHorizontal = icon("SlidersHorizontalIcon")
export const Terminal = icon("TerminalIcon")
export const Trash2 = icon("TrashIcon")
export const TrendingUp = icon("TrendUpIcon")
export const TriangleAlert = AlertTriangle
export const Unlock = icon("LockOpenIcon")
export const User = icon("UserIcon")
export const UserCheck = icon("UserCircleCheckIcon")
export const UserPlus = icon("UserPlusIcon")
export const Users = icon("UsersIcon")
export const Wallet = icon("WalletIcon")
export const Webhook = icon("WebhooksLogoIcon")
export const X = icon("XIcon")
export const XCircle = icon("XCircleIcon")
