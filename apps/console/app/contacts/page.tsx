"use client";

import { useState, type FormEvent } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { CONTACT_STATUSES, initials, type ContactStatus } from "../crm-data";
import { useCrm } from "../crm-store";
import { STATUS_BADGE_VARIANT } from "../badges";

export default function ContactsPage() {
  const { contacts, contactFilter, setContactFilter, addContact, removeContact } = useCrm();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<ContactStatus>("Lead");

  const visibleContacts = contactFilter
    ? contacts.filter((contact) =>
        [contact.name, contact.company, contact.email].some((field) =>
          field.toLowerCase().includes(contactFilter.toLowerCase()),
        ),
      )
    : contacts;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) return;
    addContact({
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      status,
    });
    setName("");
    setCompany("");
    setEmail("");
    setStatus("Lead");
    setShowForm(false);
  };

  return (
    <div className="mx-auto w-full max-w-[1220px] px-7 pt-8 pb-12 max-sm:px-4 max-sm:pt-6">
      <div className="mb-6 flex items-end justify-between gap-5 max-sm:flex-col max-sm:items-start">
        <div>
          <h1 className="font-heading text-[28px]">Contacts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Everyone your team is talking to.</p>
        </div>
        <Button onClick={() => setShowForm((open) => !open)}>
          {showForm ? "Cancel" : "New contact"}
        </Button>
      </div>

      <Card id="contacts">
        <CardHeader className="border-b p-4.5">
          <CardTitle>All contacts</CardTitle>
          <CardDescription className="text-[13px]">
            {contactFilter
              ? `Filtered by “${contactFilter}” — ${visibleContacts.length} of ${contacts.length} shown.`
              : `${contacts.length} contacts in this workspace.`}
          </CardDescription>
          {contactFilter ? (
            <CardAction>
              <Button variant="outline" size="sm" onClick={() => setContactFilter(null)}>
                Clear filter
              </Button>
            </CardAction>
          ) : null}
        </CardHeader>
        {showForm ? (
          <form
            className="flex flex-wrap items-end gap-2.5 border-b bg-muted/48 px-4.5 py-3.5"
            onSubmit={handleSubmit}
          >
            <Field className="flex-1 basis-36 gap-1.5">
              <FieldLabel className="text-xs">Name</FieldLabel>
              <Input
                autoFocus
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ada Lovelace"
              />
            </Field>
            <Field className="flex-1 basis-36 gap-1.5">
              <FieldLabel className="text-xs">Company</FieldLabel>
              <Input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="Analytical Engines"
              />
            </Field>
            <Field className="flex-1 basis-36 gap-1.5">
              <FieldLabel className="text-xs">Email</FieldLabel>
              <Input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ada@example.com"
              />
            </Field>
            <Field className="flex-1 basis-36 gap-1.5">
              <FieldLabel className="text-xs">Status</FieldLabel>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as ContactStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  {CONTACT_STATUSES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </Field>
            <Button type="submit" className="shrink-0">
              Add contact
            </Button>
          </form>
        ) : null}
        <Table className="min-w-[590px]">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Name</TableHead>
              <TableHead className="px-4">Email</TableHead>
              <TableHead className="px-4">Status</TableHead>
              <TableHead className="px-4">Owner</TableHead>
              <TableHead className="px-4">Last activity</TableHead>
              <TableHead className="px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-7 text-center text-muted-foreground">
                  {contactFilter ? "No contacts match this filter." : "No contacts yet."}
                </TableCell>
              </TableRow>
            ) : (
              visibleContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="px-4 py-3">
                    <span className="flex items-center gap-2.5">
                      <Avatar className="size-7 border text-[9px] font-medium">
                        <AvatarFallback>{initials(contact.name)}</AvatarFallback>
                      </Avatar>
                      <span className="leading-tight">
                        <strong className="block text-[13px] font-medium">{contact.name}</strong>
                        <small className="mt-0.5 block text-xs text-muted-foreground">
                          {contact.company}
                        </small>
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="px-4 font-mono text-xs text-muted-foreground">
                    {contact.email}
                  </TableCell>
                  <TableCell className="px-4">
                    <Badge variant={STATUS_BADGE_VARIANT[contact.status]}>{contact.status}</Badge>
                  </TableCell>
                  <TableCell className="px-4 text-[13px]">{contact.owner}</TableCell>
                  <TableCell className="px-4 text-[13px]">{contact.lastActivity}</TableCell>
                  <TableCell className="w-px whitespace-nowrap px-4 text-right">
                    <Button
                      variant="ghost"
                      size="xs"
                      className="text-muted-foreground hover:bg-destructive/8 hover:text-destructive-foreground"
                      aria-label={`Remove ${contact.name}`}
                      onClick={() => removeContact(contact.id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
