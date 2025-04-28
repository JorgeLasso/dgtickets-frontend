import useTickets from "./useTickets";

interface TicketGroupConfig {
  key: "priority" | "row";
  title: string;
  tagColor: string;
  tagLabel: string;
  emptyText: string;
}

export interface TicketGroupData extends TicketGroupConfig {
  tickets: ReturnType<typeof useTickets>["tickets"];
  isLoading: boolean;
  avgPending: number;
  avgProcessing: number;
  count: number;
}

const ticketGroupsConfig: TicketGroupConfig[] = [
  {
    key: "priority",
    title: "Tickets Prioritarios",
    tagColor: "red",
    tagLabel: "Prioritario",
    emptyText: "No hay Tickets prioritarios",
  },
  {
    key: "row",
    title: "Tickets Normales",
    tagColor: "blue",
    tagLabel: "Regular",
    emptyText: "No hay Tickets",
  },
];

export default function useTicketGroups(
  selectedHeadquarter: number
): TicketGroupData[] {
  const [priorityConfig, rowConfig] = ticketGroupsConfig;
  const {
    tickets: ticketsPriority,
    isLoading: loadingPriority,
    avgPending: pendingPriority,
    avgProcessing: processingPriority,
    count: countPriority,
  } = useTickets(priorityConfig.key, selectedHeadquarter);
  const {
    tickets: ticketsRow,
    isLoading: loadingRow,
    avgPending: pendingRow,
    avgProcessing: processingRow,
    count: countRow,
  } = useTickets(rowConfig.key, selectedHeadquarter);

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
