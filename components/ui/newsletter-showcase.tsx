"use client";

import { Copy, ExternalLink, Mail, Maximize2 } from "lucide-react";
import { MeshGradient, Dithering } from "@paper-design/shaders-react";
import { ButtonShadcn as Button } from "@/components/ui/button-shadcn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NewsletterEntry {
  id: number;
  week: number;
  date: string;
  title: string;
  image?: string;
  excerpt: string;
  contributors?: string[];
  content: {
    intro: string;
    sections: {
      title: string;
      items: string[];
    }[];
    closing: string;
  };
}

interface NewsletterShowcaseProps {
  newsletters: NewsletterEntry[];
}

export function NewsletterShowcase({ newsletters }: NewsletterShowcaseProps) {
  const handleCopyLink = (week: number) => {
    const url = `${window.location.origin}/newsletter#week-${week}`;
    navigator.clipboard.writeText(url);
  };

  const handleOpenInNewTab = (week: number) => {
    window.open(`/newsletter#week-${week}`, '_blank');
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* shader header full-width */}
      <div className="relative w-full overflow-hidden">
        <MeshGradient
          colors={["#5b00ff", "#00ffa3", "#ff9a00", "#ea00ff"]}
          swirl={0.55}
          distortion={0.85}
          speed={0.1}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
        <Dithering
          colors={["#ffffff", "#f2f2f2", "#eaeaea"]}
          intensity={0.18}
          shape="simplex"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/30" />

        <div className="relative container mx-auto px-4 py-12 text-left">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-white/80">
              <Mail className="size-4" />
              <p>Newsletter</p>
            </div>
            <h1 className="text-4xl font-semibold text-white leading-snug">
              Weekly AI Insights
              <br /> & Student Discoveries
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid justify-center container mx-auto px-4 border-x border-border">
        {newsletters.map((item, idx) => (
          <Dialog key={item.id}>
            <div className="relative flex flex-col lg:flex-row w-full py-16 gap-6 lg:gap-0" id={`week-${item.week}`}>
              <div className="lg:sticky top-2 h-fit">
                <time className="text-muted-foreground w-36 text-sm font-medium lg:absolute">
                  {item.date}
                </time>
              </div>

              <div className="flex max-w-prose flex-col gap-4 lg:mx-auto">
                <h3 className="text-3xl font-medium lg:pt-10 lg:text-3xl">
                  Week {item.week}: {item.title}
                </h3>

                {item.image && (
                  <DialogTrigger asChild>
                    <div className="relative cursor-pointer">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="border-border max-h-96 w-full rounded-lg border object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 rounded-lg" />
                    </div>
                  </DialogTrigger>
                )}

                <p className="text-muted-foreground text-sm font-medium">
                  {item.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {item.contributors && item.contributors.length > 0 && (
                      <>
                        <div className="flex items-center -space-x-2">
                          {item.contributors.slice(0, 3).map((src, id) => (
                            <img
                              key={id}
                              src={src}
                              alt="Contributor"
                              className="border-border size-6 rounded-full border"
                            />
                          ))}
                        </div>
                        {item.contributors.length > 3 && (
                          <span className="text-muted-foreground text-sm font-medium">
                            +{item.contributors.length - 3} contributors
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Maximize2 className="size-4" />
                            </Button>
                          </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Show full newsletter</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleCopyLink(item.week)}>
                            <Copy className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy link</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenInNewTab(item.week)}>
                            <ExternalLink className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Open in new tab</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              <div className="bg-border absolute bottom-0 left-0 right-0 h-px w-[200vw] -translate-x-1/2" />
            </div>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-prose">
              <DialogHeader>
                <DialogTitle className="text-left">Week {item.week}: {item.title}</DialogTitle>
                <DialogDescription className="text-left">
                  {item.date}
                </DialogDescription>
              </DialogHeader>

              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="border-border max-h-96 w-full rounded-lg border object-cover"
                />
              )}

              <div className="prose dark:prose-invert max-w-none">
                <p className="text-base leading-relaxed mb-6">{item.content.intro}</p>

                {item.content.sections.map((section, idx) => (
                  <div key={idx} className="mb-6">
                    <h3 className="text-xl font-semibold mb-3">{section.title}</h3>
                    <ul className="space-y-2">
                      {section.items.map((listItem, i) => (
                        <li key={i} className="text-sm leading-relaxed">{listItem}</li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="mt-8 p-4 bg-zinc-950/50 border border-zinc-800 rounded-lg text-center">
                  <p className="italic text-base">{item.content.closing}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </section>
  );
}
