"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Activity, Map, ChefHat, Trophy } from "lucide-react";
import FamilyMediaGallery from "@/components/FamilyMediaGallery";
import BlogSection from "@/components/BlogSection";
import type { MediaItem, FamilyMemberId } from "@/lib/family-media-shared";
import type { BlogPost } from "@/lib/lifestyle-shared";

type FamilyMember = {
  id: FamilyMemberId;
  name: string;
  role: string;
  description: string;
  image: string;
  hobbies: { icon: React.ReactNode; text: string }[];
};

const familyMembers: FamilyMember[] = [
  {
    id: "rafael",
    name: "Rafael",
    role: "Older Son",
    description:
      "Rafael is deeply passionate about soccer and currently plays with the Under 12 Glen Waverley Performance team. When he's not on the field, he really enjoys swimming and cooking up a storm in the kitchen.",
    image: "/family/rafael/rafa-profile.jpg",
    hobbies: [
      { icon: <Trophy size={18} />, text: "U12 Glen Waverley Soccer" },
      { icon: <Activity size={18} />, text: "Swimming" },
      { icon: <ChefHat size={18} />, text: "Cooking" },
    ],
  },
  {
    id: "mikhail",
    name: "Mikhail",
    role: "Younger Son",
    description:
      "Mikhail is a natural athlete who enjoys swimming and is exceptionally good at playing basketball. He brings energy and enthusiasm to every game he plays.",
    image:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    hobbies: [
      { icon: <Trophy size={18} />, text: "Basketball" },
      { icon: <Activity size={18} />, text: "Swimming" },
    ],
  },
  {
    id: "mira",
    name: "Mira",
    role: "Wife",
    description:
      "Mira is the heart of our family. She has a deep love for traveling, hiking, and exploring different places around the world, always planning our next great adventure.",
    image: "/family/mira/Mira_sketch.png",
    hobbies: [
      { icon: <Map size={18} />, text: "Traveling" },
      { icon: <Activity size={18} />, text: "Hiking" },
      { icon: <Heart size={18} />, text: "Exploring" },
    ],
  },
];

type FamilyPageContentProps = {
  initialMedia: Record<FamilyMemberId, MediaItem[]>;
  initialBlogs: Record<FamilyMemberId, BlogPost[]>;
  isLoggedIn: boolean;
};

export default function FamilyPageContent({
  initialMedia,
  initialBlogs,
  isLoggedIn,
}: FamilyPageContentProps) {
  const [mediaByMember, setMediaByMember] = useState(initialMedia);
  const [blogsByMember, setBlogsByMember] = useState(initialBlogs);
  const [activeSectionByMember, setActiveSectionByMember] = useState<
    Record<FamilyMemberId, "blog" | "media">
  >({
    rafael: "blog",
    mikhail: "blog",
    mira: "blog",
  });

  const updateMemberMedia = (memberId: FamilyMemberId, media: MediaItem[]) => {
    setMediaByMember((prev) => ({ ...prev, [memberId]: media }));
  };

  const updateMemberBlogs = (memberId: FamilyMemberId, blogs: BlogPost[]) => {
    setBlogsByMember((prev) => ({ ...prev, [memberId]: blogs }));
  };

  return (
    <div className="min-h-screen pt-32 pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-surface-border mb-6"
          >
            <Heart size={14} className="text-primary" />
            <span className="text-xs font-medium text-gray-300">My World</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Meet My <span className="text-primary">Family</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 leading-relaxed"
          >
            Behind every great engineer is a great support system. Here are the people who inspire me
            every day.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-24">
          {familyMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-surface border border-surface-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors"
            >
              <div className="h-64 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent z-10" />
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-8 relative z-20 -mt-20">
                <div className="mb-4">
                  <h2 className="text-3xl font-bold text-white mb-1">{member.name}</h2>
                  <p className="text-primary font-medium">{member.role}</p>
                </div>

                <p className="text-gray-400 mb-8 leading-relaxed">{member.description}</p>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                    Interests & Hobbies
                  </h4>
                  {member.hobbies.map((hobby, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-300">
                      <div className="w-8 h-8 rounded-full bg-black border border-surface-border flex items-center justify-center text-primary">
                        {hobby.icon}
                      </div>
                      <span className="font-medium">{hobby.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-16">
          {familyMembers.map((member, index) => (
            <motion.section
              key={member.id}
              id={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface border border-surface-border rounded-2xl p-6 md:p-10"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary shrink-0">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      {member.name}
                      <span className="text-primary">.</span>
                    </h2>
                    <p className="text-gray-400">{member.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-1 bg-black border border-surface-border rounded-lg self-start">
                  {(["blog", "media"] as const).map((section) => (
                    <button
                      key={section}
                      onClick={() =>
                        setActiveSectionByMember((prev) => ({ ...prev, [member.id]: section }))
                      }
                      className={`px-5 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                        activeSectionByMember[member.id] === section
                          ? "bg-primary text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {section === "blog" ? "Blog" : "Photos & Videos"}
                    </button>
                  ))}
                </div>
              </div>

              {activeSectionByMember[member.id] === "blog" ? (
                <BlogSection
                  apiPath={`/api/family/${member.id}/blogs`}
                  sectionTitle={member.name}
                  blogs={blogsByMember[member.id]}
                  isLoggedIn={isLoggedIn}
                  onBlogsChange={(blogs) => updateMemberBlogs(member.id, blogs)}
                />
              ) : (
                <FamilyMediaGallery
                  memberId={member.id}
                  memberName={member.name}
                  media={mediaByMember[member.id]}
                  isLoggedIn={isLoggedIn}
                  onMediaChange={(media) => updateMemberMedia(member.id, media)}
                />
              )}
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}
