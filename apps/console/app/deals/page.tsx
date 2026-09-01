"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { XIcon } from "lucide-react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import { Button } from "@/components/ui/button";
import { Card, CardPanel } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DEAL_STAGES, formatCurrency, type Deal, type DealStage } from "../crm-data";
import { useCrm } from "../crm-store";
import { dndAwareCardAnimation, setDndInFlight } from "./card-animation";

function DealCardBody({ deal }: { deal: Deal }) {
  return (
    <>
      <strong className="text-xs font-semibold">{deal.name}</strong>
      <small className="mt-0.5 text-[11px] text-muted-foreground">{deal.company}</small>
      <b className="mt-2 font-mono text-[11px] font-semibold">{formatCurrency(deal.value)}</b>
    </>
  );
}

function DealCard({ deal, onRemove }: { deal: Deal; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal.id });

  return (
    <Card
      render={<article />}
      ref={setNodeRef}
      className={`group flex cursor-grab touch-none flex-col rounded-xl px-3.5 py-3 transition-shadow before:rounded-[calc(var(--radius-xl)-1px)] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-ring${
        isDragging ? " opacity-35" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <DealCardBody deal={deal} />
      <Button
        variant="ghost"
        size="icon-xs"
        className="absolute top-1.5 right-1.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:bg-destructive/8 hover:text-destructive-foreground"
        aria-label={`Remove ${deal.name}`}
        onClick={() => onRemove(deal.id)}
      >
        <XIcon />
      </Button>
    </Card>
  );
}

function PipelineColumn({
  stage,
  deals,
  onRemove,
}: {
  stage: DealStage;
  deals: Deal[];
  onRemove: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const [listRef] = useAutoAnimate<HTMLDivElement>(dndAwareCardAnimation);
  const stageValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div
      ref={setNodeRef}
      className={`-m-1.5 flex flex-col gap-2 rounded-xl p-1.5 transition-colors${
        isOver ? " bg-muted" : ""
      }`}
    >
      <div className="flex items-baseline justify-between gap-2 px-1 pb-1.5 text-xs font-semibold">
        <span>{stage}</span>
        <small className="text-[10px] font-medium text-muted-foreground">
          {deals.length} · {formatCurrency(stageValue)}
        </small>
      </div>
      <div className="flex min-h-11 flex-col gap-2" ref={listRef}>
        {deals.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-[11px] text-muted-foreground">
            No deals
          </p>
        ) : (
          deals.map((deal) => <DealCard key={deal.id} deal={deal} onRemove={onRemove} />)
        )}
      </div>
    </div>
  );
}

export default function DealsPage() {
  const { deals, addDeal, removeDeal, updateDealStage } = useCrm();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState<DealStage>("Qualified");
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const dragSettleRef = useRef<number | null>(null);
  const [contentRef] = useAutoAnimate<HTMLDivElement>();

  useEffect(() => {
    return () => {
      if (dragSettleRef.current !== null) window.clearTimeout(dragSettleRef.current);
      setDndInFlight(false);
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const openDeals = deals.filter((deal) => deal.stage !== "Won");
  const openValue = openDeals.reduce((sum, deal) => sum + deal.value, 0);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedValue = Number(value);
    if (!name.trim() || !Number.isFinite(parsedValue) || parsedValue <= 0) return;
    addDeal({
      name: name.trim(),
      company: company.trim(),
      value: parsedValue,
      stage,
    });
    setName("");
    setCompany("");
    setValue("");
    setStage("Qualified");
    setShowForm(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (dragSettleRef.current !== null) {
      window.clearTimeout(dragSettleRef.current);
      dragSettleRef.current = null;
    }
    setDndInFlight(true);
    setActiveDeal(deals.find((deal) => deal.id === event.active.id) ?? null);
  };

  const endDrag = () => {
    setActiveDeal(null);
    // Keep instant animations through the drop's DOM mutations, then hand
    // add/remove animations back to auto-animate.
    dragSettleRef.current = window.setTimeout(() => {
      dragSettleRef.current = null;
      setDndInFlight(false);
    }, 200);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    endDrag();
    const targetStage = event.over?.id;
    if (typeof targetStage !== "string") return;
    if (!DEAL_STAGES.includes(targetStage as DealStage)) return;
    updateDealStage(String(event.active.id), targetStage as DealStage);
  };

  return (
    <div
      className="mx-auto w-full max-w-[1220px] px-7 pt-8 pb-12 max-sm:px-4 max-sm:pt-6"
      ref={contentRef}
    >
      <div className="mb-6 flex items-end justify-between gap-5 max-sm:flex-col max-sm:items-start">
        <div>
          <h1 className="font-heading text-2xl">Deals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatCurrency(openValue)} open across {openDeals.length} active deals.
          </p>
        </div>
        <Button onClick={() => setShowForm((open) => !open)}>
          {showForm ? "Cancel" : "New deal"}
        </Button>
      </div>

      {showForm ? (
        <Card className="mb-3.5">
          <CardPanel className="p-0">
            <form
              className="flex flex-wrap items-end gap-2.5 rounded-2xl bg-muted/48 px-4.5 py-3.5"
              onSubmit={handleSubmit}
            >
              <Field className="flex-1 basis-36 gap-1.5">
                <FieldLabel className="text-xs">Deal name</FieldLabel>
                <Input
                  autoFocus
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Platform rollout"
                />
              </Field>
              <Field className="flex-1 basis-36 gap-1.5">
                <FieldLabel className="text-xs">Company</FieldLabel>
                <Input
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="Brightline Labs"
                />
              </Field>
              <Field className="flex-1 basis-36 gap-1.5">
                <FieldLabel className="text-xs">Value (USD)</FieldLabel>
                <Input
                  required
                  type="number"
                  min={1}
                  step={1}
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  placeholder="25000"
                />
              </Field>
              <Field className="flex-1 basis-36 gap-1.5">
                <FieldLabel className="text-xs">Stage</FieldLabel>
                <Select
                  value={stage}
                  onValueChange={(nextStage) => setStage(nextStage as DealStage)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    {DEAL_STAGES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              </Field>
              <Button type="submit" className="shrink-0">
                Add deal
              </Button>
            </form>
          </CardPanel>
        </Card>
      ) : null}

      <DndContext
        id="deals-board"
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={endDrag}
      >
        <section
          id="deals"
          className="grid grid-cols-4 items-start gap-3.5 max-lg:grid-cols-2 max-sm:grid-cols-1"
          aria-label="Deal pipeline"
        >
          {DEAL_STAGES.map((columnStage) => (
            <PipelineColumn
              key={columnStage}
              stage={columnStage}
              deals={deals.filter((deal) => deal.stage === columnStage)}
              onRemove={removeDeal}
            />
          ))}
        </section>
        {/* Portal the overlay out of the auto-animated page container, which
            would otherwise treat it as a list item and animate/transform it
            while dnd-kit is positioning it. */}
        {typeof document !== "undefined"
          ? createPortal(
              <DragOverlay>
                {activeDeal ? (
                  <Card
                    render={<article />}
                    className="flex cursor-grabbing flex-col rounded-xl px-3.5 py-3 shadow-lg before:rounded-[calc(var(--radius-xl)-1px)]"
                  >
                    <DealCardBody deal={activeDeal} />
                  </Card>
                ) : null}
              </DragOverlay>,
              document.body,
            )
          : null}
      </DndContext>
    </div>
  );
}
