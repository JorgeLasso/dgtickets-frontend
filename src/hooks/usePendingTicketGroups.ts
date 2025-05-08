import usePendingTickets from "./usePendingTickets";

interface PendingTicketGroupConfig {
  key: "priority" | "row";
  title: string;
  tagColor: string;
  tagLabel: string;
  emptyText: string;
}

export interface PendingTicketGroupData extends PendingTicketGroupConfig {
  tickets: ReturnType<typeof usePendingTickets>["tickets"];
  isLoading: boolean;
  avgPending: number;
  avgProcessing: number;
  count: number;
}

const pendingTicketGroupsConfig: PendingTicketGroupConfig[] = [
  {
    key: "priority",
    title: "Turnos Prioritarios",
    tagColor: "red",
    tagLabel: "Prioritario",
    emptyText: "No hay Turnos prioritarios en cola",
  },
  {
    key: "row",
    title: "Turnos Normales",
    tagColor: "blue",
    tagLabel: "Regular",
    emptyText: "No hay Turnos en cola",
  },
];

export default function usePendingTicketGroups(
  selectedHeadquarter: number
): PendingTicketGroupData[] {
  const [priorityConfig, rowConfig] = pendingTicketGroupsConfig;
  const {
    tickets: ticketsPriority,
    isLoading: loadingPriority,
    avgPending: pendingPriority,
    avgProcessing: processingPriority,
    count: countPriority,
  } = usePendingTickets(priorityConfig.key, selectedHeadquarter);
  const {
    tickets: ticketsRow,
    isLoading: loadingRow,
    avgPending: pendingRow,
    avgProcessing: processingRow,
    count: countRow,
  } = usePendingTickets(rowConfig.key, selectedHeadquarter);

  return [
    {
      ...priorityConfig,
      tickets: ticketsPriority,
      isLoading: loadingPriority,
      avgPending: pendingPriority,
      avgProcessing: processingPriority,
      count: countPriority,
    },
    {
      ...rowConfig,
      tickets: ticketsRow,
      isLoading: loadingRow,
      avgPending: pendingRow,
      avgProcessing: processingRow,
      count: countRow,
    },
  ];
}
