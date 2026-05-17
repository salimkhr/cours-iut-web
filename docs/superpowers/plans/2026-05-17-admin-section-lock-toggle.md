# Admin Section Lock Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un toggle lock/unlock interactif sur les SectionCards pour les admins, et migrer AddModuleButton de Dialog vers Sheet.

**Architecture:** Deux fichiers modifiés indépendamment. `SectionCard` reçoit un `useState` optimiste + appel à `updateSectionState`. `AddModuleButton` garde son formulaire identique mais remplace `Dialog` par `Sheet` en suivant le pattern de `EditModuleSheet`.

**Tech Stack:** React 19, Next.js App Router, Tailwind CSS v4, shadcn/ui (Sheet), lucide-react, axios (via updateSectionState existant).

> **Note :** Ce projet n'a pas de suite de tests (cf. CLAUDE.md §8). Les étapes TDD sont remplacées par une vérification manuelle dans le navigateur.

---

## Fichiers modifiés

| Fichier | Rôle |
|---------|------|
| `src/components/Cards/SectionCard.tsx` | Ajout toggle admin lock/unlock |
| `src/components/admin/AddModuleButton.tsx` | Migration Dialog → Sheet |

---

### Task 1 — Toggle lock/unlock sur SectionCard

**Fichier :** `src/components/Cards/SectionCard.tsx`

- [ ] **Lire le fichier actuel**

  Ouvrir `src/components/Cards/SectionCard.tsx` pour avoir le code de base (204 lignes). Points clés :
  - Ligne 1 : `'use client'` — déjà un Client Component
  - Ligne 22 : `const isLocked = !isAdmin && !section.isAvailable;`
  - Lignes 92–97 : badge statique "Verrouillé" (affiché uniquement si `isLocked`)
  - Le wrapper de contenu (ligne 70) a `pointer-events-none` ; les boutons d'action (ligne 123) ont `pointer-events-auto`

- [ ] **Réécrire `SectionCard.tsx` avec le toggle admin**

  Remplacer le contenu complet du fichier par :

  ```tsx
  'use client';

  import {useState} from 'react';
  import Link from "next/link";
  import {motion, useReducedMotion} from 'framer-motion';
  import {BookOpen, Clock, Gitlab, Lock, Unlock} from "lucide-react";

  import Section from "@/types/Section";
  import Module from "@/types/Module";
  import {cn} from "@/lib/utils";
  import {CONTENT_ICON, CONTENT_ORDER, ContentKey} from "@/lib/contentMeta";
  import {Button} from "@/components/ui/button";
  import CardBridgeBackground from "@/components/Cards/CardBridgeBackground";
  import updateSectionState from "@/hook/admin/updateSectionState";

  interface SectionCardProps {
      section: Section;
      currentModule: Module;
      isAdmin: boolean;
  }

  export default function SectionCard({section, currentModule, isAdmin}: SectionCardProps) {
      const {path: modulePath} = currentModule;
      const [available, setAvailable] = useState(section.isAvailable);
      const isLocked = !isAdmin && !available;
      const sectionHref = available || isAdmin
          ? `/${modulePath}/${section.path}`
          : '#';

      const prefersReducedMotion = useReducedMotion();

      const sortedContents = [...section.contents].sort(
          (a, b) => CONTENT_ORDER.indexOf(a as ContentKey) - CONTENT_ORDER.indexOf(b as ContentKey)
      );

      async function handleToggleLock() {
          const next = !available;
          setAvailable(next);
          await updateSectionState(currentModule._id as string, section.order, 'isAvailable', next);
      }

      return (
          <motion.article
              style={{'--module-color': `var(--color-${modulePath})`} as React.CSSProperties}
              className={cn(
                  "group relative h-full flex flex-col p-7 lg:p-9 rounded-2xl overflow-hidden",
                  "bg-[#f7ebd9] dark:bg-[#13110d]",
                  "border border-bridge-500/45 dark:border-bridge-500/35",
                  "shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)]",
                  "dark:shadow-[0_2px_14px_-6px_rgba(0,0,0,0.6)]",
                  "transition-[box-shadow,border-color] duration-300 ease-out",
                  !isLocked && "hover:border-bridge-500/65 dark:hover:border-bridge-400/55 hover:shadow-[0_22px_44px_-14px_rgba(147,97,58,0.55)] dark:hover:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.75)]",
                  isLocked && "opacity-85",
              )}
              whileHover={!isLocked && !prefersReducedMotion ? {y: -6} : {}}
              transition={{duration: 0.3, ease: "easeOut"}}
          >
              <CardBridgeBackground/>

              {/* Whole-card click target — section landing page (z-10) */}
              {!isLocked && (
                  <Link
                      href={sectionHref}
                      aria-label={`Ouvrir la section ${section.order}. ${section.title}`}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="absolute inset-0 rounded-2xl z-10"
                  />
              )}

              {/* Top edge highlight */}
              <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-linear-to-r from-transparent via-bridge-100/70 to-transparent dark:via-bridge-500/30 z-10"
              />

              <div className="relative z-20 flex flex-col gap-7 h-full pointer-events-none">

                  {/* Header: order chip + title + duration + lock state */}
                  <header className="flex items-center gap-3">
                      <div className={cn(
                          "inline-flex items-center justify-center min-w-9 h-9 px-2.5 rounded-lg text-white font-mono font-bold text-sm shadow-sm shrink-0",
                          `bg-${modulePath}`
                      )}>
                          {section.order.toString().padStart(2, '0')}
                      </div>
                      <h3 className={cn(
                          "text-xl lg:text-2xl font-bold tracking-tight leading-tight flex-1 min-w-0",
                          `text-${modulePath}`
                      )}>
                          {section.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark dark:text-bridge-200/70 whitespace-nowrap">
                              <Clock className="w-3.5 h-3.5"/>
                              {section.totalDuration}
                              <span className="hidden sm:inline">&nbsp;séance{section.totalDuration > 1 ? 's' : ''}</span>
                          </span>
                          {isAdmin ? (
                              <button
                                  type="button"
                                  onClick={handleToggleLock}
                                  className={cn(
                                      "pointer-events-auto inline-flex items-center gap-1 rounded-md px-2 py-0.5",
                                      "text-[10px] uppercase tracking-[0.18em] font-semibold",
                                      "transition-colors duration-200 cursor-pointer",
                                      available
                                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                                          : "bg-bridge-700/30 text-brand-dark dark:bg-bridge-500/30 dark:text-bridge-100 hover:bg-bridge-700/50"
                                  )}
                                  aria-label={available ? "Verrouiller la section" : "Déverrouiller la section"}
                              >
                                  {available ? (
                                      <>
                                          <Unlock className="w-3 h-3"/>
                                          <span className="hidden sm:inline">Disponible</span>
                                      </>
                                  ) : (
                                      <>
                                          <Lock className="w-3 h-3"/>
                                          <span className="hidden sm:inline">Verrouillé</span>
                                      </>
                                  )}
                              </button>
                          ) : (
                              isLocked && (
                                  <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] font-semibold bg-bridge-700/30 text-brand-dark dark:bg-bridge-500/30 dark:text-bridge-100">
                                      <Lock className="w-3 h-3"/>
                                      <span className="hidden sm:inline">Verrouillé</span>
                                  </span>
                              )
                          )}
                      </div>
                  </header>

                  {/* Description */}
                  {section.description && (
                      <p className="text-sm leading-relaxed font-medium text-brand-dark dark:text-bridge-100/90 flex-grow">
                          {section.description}
                      </p>
                  )}

                  {/* Tags */}
                  {section.tags && section.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                          {section.tags.map((tag) => (
                              <span
                                  key={tag}
                                  className="inline-flex items-center font-mono text-[11px] tracking-tight px-2.5 py-1 rounded-md border border-bridge-700/40 text-brand-dark dark:border-bridge-400/40 dark:text-bridge-100"
                              >
                                  #{tag}
                              </span>
                          ))}
                      </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2.5 pt-3 mt-auto border-t border-bridge-700/20 dark:border-bridge-500/20 pointer-events-auto">
                      {sortedContents.map((item) => {
                          const Icon = CONTENT_ICON[item as ContentKey] ?? BookOpen;
                          const disabled = isLocked;
                          const buttonClassName = cn(
                              "group/btn flex-1 min-w-[88px] rounded-lg",
                              "text-xs font-semibold tracking-wide uppercase",
                              "border-2 border-(--module-color) text-brand-dark dark:text-bridge-50",
                              "bg-transparent shadow-none",
                              "hover:bg-(--module-color) hover:text-white hover:shadow-md hover:border-(--module-color)",
                              "transition-[color,border-color,background-color,box-shadow] duration-300",
                              disabled && "opacity-50 pointer-events-none cursor-not-allowed"
                          );
                          const iconClassName = "w-4 h-4 shrink-0 text-(--module-color) group-hover/btn:text-white transition-colors duration-300";
                          const label = item.charAt(0).toUpperCase() + item.slice(1);

                          return (
                              <Button
                                  key={item}
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className={buttonClassName}
                              >
                                  {disabled ? (
                                      <span aria-disabled="true">
                                          <Icon className={iconClassName}/>
                                          <span className="hidden md:inline">{label}</span>
                                      </span>
                                  ) : (
                                      <Link href={`/${modulePath}/${section.path}/${item}`}>
                                          <Icon className={iconClassName}/>
                                          <span className="hidden md:inline">{label}</span>
                                      </Link>
                                  )}
                              </Button>
                          );
                      })}

                      {section.hasCorrection && (() => {
                          const correctionDisabled = !isAdmin && !section.correctionIsAvailable;
                          const correctionClassName = cn(
                              "group/btn flex-1 min-w-[88px] rounded-lg",
                              "text-xs font-semibold tracking-wide uppercase",
                              "border-2 border-dashed border-(--module-color) text-brand-dark dark:text-bridge-50",
                              "bg-transparent shadow-none",
                              "hover:border-solid hover:bg-(--module-color) hover:text-white hover:shadow-md hover:border-(--module-color)",
                              "transition-[color,border-color,background-color,box-shadow] duration-300",
                              correctionDisabled && "opacity-50 pointer-events-none cursor-not-allowed"
                          );
                          const correctionIconClass = "w-4 h-4 shrink-0 text-(--module-color) group-hover/btn:text-white transition-colors duration-300";

                          return (
                              <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className={correctionClassName}
                              >
                                  {correctionDisabled ? (
                                      <span aria-disabled="true">
                                          <Gitlab className={correctionIconClass}/>
                                          <span className="hidden md:inline">Correction</span>
                                      </span>
                                  ) : (
                                      <Link
                                          href={`${process.env.NEXT_PUBLIC_GIT_URL}/${modulePath}/${section.path}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                      >
                                          <Gitlab className={correctionIconClass}/>
                                          <span className="hidden md:inline">Correction</span>
                                      </Link>
                                  )}
                              </Button>
                          );
                      })()}
                  </div>
              </div>
          </motion.article>
      );
  }
  ```

- [ ] **Vérifier dans le navigateur (admin connecté)**

  Ouvrir une page de module (ex. `/javascript`). Vérifier :
  - Chaque section affiche un badge vert "Disponible" ou ambre "Verrouillé" selon `isAvailable`
  - Cliquer sur le badge bascule l'état visuellement immédiatement (optimiste)
  - La page rechargée confirme le changement persisté en base
  - Connecté en non-admin : comportement inchangé (badge statique "Verrouillé" si non disponible, rien sinon)

- [ ] **Commiter**

  ```bash
  git add src/components/Cards/SectionCard.tsx
  git commit -m "feat(admin): add interactive lock/unlock toggle on SectionCard for admins"
  ```

---

### Task 2 — Migrer AddModuleButton de Dialog vers Sheet

**Fichier :** `src/components/admin/AddModuleButton.tsx`

- [ ] **Lire le fichier actuel**

  Ouvrir `src/components/admin/AddModuleButton.tsx` (211 lignes). Points clés :
  - Lignes 5–6 : imports `Dialog`, `DialogContent`, `DialogFooter`, `DialogHeader`, `DialogTitle`
  - Ligne 100 : `<Dialog open={open} onOpenChange={setOpen}>`
  - Le formulaire intérieur (lignes 105–202) reste **identique** — seul le conteneur change
  - `FIXED_COMPETENCES` et `FIXED_SAES` sont dupliqués localement (ne pas refactoriser dans cette tâche)

- [ ] **Réécrire `AddModuleButton.tsx` avec Sheet**

  Remplacer le contenu complet du fichier par :

  ```tsx
  'use client';

  import {useEffect, useState} from 'react';
  import {useForm, useWatch} from 'react-hook-form';
  import {Sheet, SheetContent, SheetTitle, SheetDescription} from "@/components/ui/sheet";
  import {Button} from "@/components/ui/button";
  import {Input} from "@/components/ui/input";
  import {Label} from "@/components/ui/label";
  import Section from "@/types/Section";
  import Coefficient from "@/types/Coefficient";
  import Instructor from "@/types/Instructor";
  import {Textarea} from "@/components/ui/textarea";
  import {cn} from "@/lib/utils";

  interface AddModuleButtonProps {
      onAdd: (module: {
          title: string;
          path: string;
          iconName: string;
          description?: string;
          associatedSae: string[];
          coefficients: Coefficient[];
          manager?: Instructor;
          instructors?: Instructor[];
          sections: Section[];
      }) => void;
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
  }

  type FormData = {
      title: string;
      path: string;
      iconName: string;
      description?: string;
      associatedSae: string[];
      coefficients: Coefficient[];
      manager: Instructor;
      instructors: Instructor[];
  };

  const FIXED_COMPETENCES = [
      "1/ Réaliser un développement",
      "2/ Optimiser des applications",
      "3/ Administrer des systèmes informatiques communicants complexes",
      "4/ Gérer des données de l'information",
      "5/ Conduire un projet",
      "6/ Travailler en équipe"
  ];

  const FIXED_SAES = [
      "S2.01 : Développement d'application",
      "S2.02 : Exploration algorithmique d'un problème",
      "S2.05 : Gestion d'un projet",
      "S3.01 : Développement d'une Application",
      "S4.01 : Développement d'une application",
  ];

  const inputCn = "bg-bridge-100/60 dark:bg-bridge-800/60 border-bridge-500/45 focus-visible:ring-bridge-500/50";
  const labelCn = "text-sm font-semibold text-brand-dark dark:text-bridge-200";

  export default function AddModuleButton({onAdd, open: controlledOpen, onOpenChange}: AddModuleButtonProps) {
      const [internalOpen, setInternalOpen] = useState(false);
      const isControlled = controlledOpen !== undefined;
      const open = isControlled ? controlledOpen : internalOpen;
      const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;

      const {register, handleSubmit, control, setValue, reset, formState: {errors}} = useForm<FormData>({
          defaultValues: {
              coefficients: FIXED_COMPETENCES.map(c => ({competenceName: c, value: 0})),
              instructors: [{firstName: "", lastName: "", email: ""}],
              manager: {firstName: "", lastName: "", email: ""}
          }
      });

      const title = useWatch({control, name: "title"});
      const instructors = useWatch({control, name: "instructors"});

      useEffect(() => {
          if (title) {
              setValue("path", title.toLowerCase().replace(/\s+/g, '-'));
          }
      }, [title, setValue]);

      const onSubmit = (data: FormData) => {
          onAdd({
              ...data,
              sections: [],
          });
          reset();
          setOpen(false);
      };

      return (
          <>
              {!isControlled && (
                  <div className="flex justify-end">
                      <Button
                          onClick={() => setOpen(true)}
                          className="bg-brand-primary text-white hover:bg-brand-accent-dark"
                      >
                          Ajouter un module
                      </Button>
                  </div>
              )}

              <Sheet open={open} onOpenChange={setOpen}>
                  <SheetContent
                      side="right"
                      className={cn(
                          'p-0 gap-0 overflow-hidden flex flex-col sm:max-w-[520px]',
                          'bg-[#f7ebd9] dark:bg-[#13110d]',
                          'border-l border-bridge-500/45',
                          '[&>button]:text-white/80 [&>button:hover]:text-white',
                      )}
                  >
                      {/* Header */}
                      <div className="relative flex items-center gap-4 px-6 py-5 pr-14 overflow-hidden shrink-0 bg-brand-primary">
                          <div
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                          />
                          <div className="flex flex-col gap-0.5">
                              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white/60">
                                  Module
                              </p>
                              <SheetTitle className="text-white font-bold text-xl leading-tight p-0 m-0">
                                  Ajouter un nouveau module
                              </SheetTitle>
                          </div>
                          <SheetDescription className="sr-only">
                              Formulaire de création d&apos;un nouveau module
                          </SheetDescription>
                      </div>

                      {/* Body + Footer */}
                      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                              {/* Titre + Path */}
                              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                  <div className="flex-1">
                                      <Label htmlFor="am-title" className={labelCn}>Titre *</Label>
                                      <Input
                                          id="am-title"
                                          className={inputCn}
                                          {...register("title", {required: "Le titre est obligatoire"})}
                                          aria-invalid={errors.title ? "true" : "false"}
                                      />
                                      {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                                  </div>
                                  <div className="w-36">
                                      <Label htmlFor="am-path" className={labelCn}>Path *</Label>
                                      <Input
                                          id="am-path"
                                          className={inputCn}
                                          {...register("path", {required: "Le path est obligatoire"})}
                                          aria-invalid={errors.path ? "true" : "false"}
                                      />
                                      {errors.path && <p className="text-red-500 text-xs mt-1">{errors.path.message}</p>}
                                  </div>
                              </div>

                              {/* Icon */}
                              <div>
                                  <Label htmlFor="am-icon" className={labelCn}>Icon Name *</Label>
                                  <Input
                                      id="am-icon"
                                      className={inputCn}
                                      {...register("iconName", {required: "L'icône est obligatoire"})}
                                      aria-invalid={errors.iconName ? "true" : "false"}
                                  />
                                  {errors.iconName && <p className="text-red-500 text-xs mt-1">{errors.iconName.message}</p>}
                              </div>

                              {/* Description */}
                              <div>
                                  <Label htmlFor="am-description" className={labelCn}>Description</Label>
                                  <Textarea id="am-description" className={inputCn} {...register("description")}/>
                              </div>

                              {/* Coefficients */}
                              <div>
                                  <Label className={labelCn}>Coefficients</Label>
                                  <div className="space-y-2 mt-1">
                                      {FIXED_COMPETENCES.map((competence, index) => (
                                          <div key={index} className="flex gap-2 items-center">
                                              <span className="flex-1 text-sm text-brand-dark dark:text-bridge-100">{competence}</span>
                                              <Input
                                                  type="number"
                                                  step="1"
                                                  className={cn(inputCn, "w-20 text-center")}
                                                  {...register(`coefficients.${index}.value` as const, {valueAsNumber: true})}
                                              />
                                              <input
                                                  type="hidden"
                                                  {...register(`coefficients.${index}.competenceName` as const)}
                                                  value={competence}
                                              />
                                          </div>
                                      ))}
                                  </div>
                              </div>

                              {/* Responsable */}
                              <div>
                                  <Label className={labelCn}>Responsable du module</Label>
                                  <div className="grid grid-cols-3 gap-2 mt-1">
                                      <Input placeholder="Prénom" className={inputCn} {...register("manager.firstName")}/>
                                      <Input placeholder="Nom" className={inputCn} {...register("manager.lastName")}/>
                                      <Input placeholder="Email" type="email" className={inputCn} {...register("manager.email")}/>
                                  </div>
                              </div>

                              {/* Enseignants */}
                              <div>
                                  <Label className={labelCn}>Enseignants</Label>
                                  <div className="space-y-2 mt-1">
                                      {instructors.map((_, index) => (
                                          <div key={index} className="grid grid-cols-3 gap-2">
                                              <Input placeholder="Prénom" className={inputCn} {...register(`instructors.${index}.firstName` as const)}/>
                                              <Input placeholder="Nom" className={inputCn} {...register(`instructors.${index}.lastName` as const)}/>
                                              <Input placeholder="Email" type="email" className={inputCn} {...register(`instructors.${index}.email` as const)}/>
                                          </div>
                                      ))}
                                  </div>
                              </div>

                              {/* SAÉ */}
                              <div>
                                  <Label className={labelCn}>SAÉ associées</Label>
                                  <select
                                      multiple
                                      className="mt-1 border border-bridge-500/45 rounded-md p-2 w-full bg-bridge-100/60 dark:bg-bridge-800/60"
                                      {...register("associatedSae")}
                                  >
                                      {FIXED_SAES.map((sae, index) => (
                                          <option key={index} value={sae}>{sae}</option>
                                      ))}
                                  </select>
                              </div>
                          </div>

                          {/* Footer sticky */}
                          <div className="shrink-0 border-t border-bridge-700/20 dark:border-bridge-500/20 px-6 py-4 flex items-center justify-between gap-3">
                              <Button
                                  type="button"
                                  variant="ghost"
                                  className="text-brand-dark dark:text-bridge-200"
                                  onClick={() => setOpen(false)}
                              >
                                  Annuler
                              </Button>
                              <Button
                                  type="submit"
                                  className="bg-brand-primary text-white hover:bg-brand-accent-dark"
                              >
                                  Ajouter
                              </Button>
                          </div>
                      </form>
                  </SheetContent>
              </Sheet>
          </>
      );
  }
  ```

- [ ] **Vérifier dans le navigateur (admin connecté)**

  Ouvrir la home `/`. Cliquer sur le FAB admin (icône clé) → "Créer un module". Vérifier :
  - Le formulaire s'ouvre en Sheet (panneau latéral droit) et non en modale centrée
  - Le header affiche "Ajouter un nouveau module" sur fond `bg-brand-primary`
  - Tous les champs sont présents (titre, path, icon, description, coefficients, responsable, enseignants, SAÉ)
  - Le footer a les boutons "Annuler" et "Ajouter"
  - La soumission crée le module et ferme le Sheet

- [ ] **Commiter**

  ```bash
  git add src/components/admin/AddModuleButton.tsx
  git commit -m "feat(admin): migrate AddModuleButton from Dialog to Sheet for UI consistency"
  ```
