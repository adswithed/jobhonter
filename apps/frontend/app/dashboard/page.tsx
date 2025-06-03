"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Bot, CheckCircle, FileText, Search } from "lucide-react"
import Image from "next/image"

export default function DashboardPage() {
  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Alex!</p>
        </div>
        <Button>
          <Bot className="mr-2 h-4 w-4" />
          Configure Agent
        </Button>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications Sent</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">+4 from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jobs Found</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">+12 from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Replies</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">+2 from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agent Status</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">Active</div>
                <p className="text-xs text-muted-foreground">Running normally</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Your most recent job applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      company: "Acme Inc",
                      position: "Senior Developer",
                      date: "2 days ago",
                      status: "Pending",
                    },
                    {
                      company: "Globex Corp",
                      position: "Product Manager",
                      date: "3 days ago",
                      status: "Interview",
                    },
                    {
                      company: "Stark Industries",
                      position: "UX Designer",
                      date: "5 days ago",
                      status: "Rejected",
                    },
                    {
                      company: "Wayne Enterprises",
                      position: "Frontend Developer",
                      date: "1 week ago",
                      status: "Pending",
                    },
                  ].map((application, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{application.position}</p>
                        <p className="text-sm text-muted-foreground">{application.company}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm text-muted-foreground">{application.date}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            application.status === "Interview"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : application.status === "Rejected"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          }`}
                        >
                          {application.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>Daily application metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Daily Applications</div>
                    <div className="text-sm text-muted-foreground">8/10</div>
                  </div>
                  <Progress value={80} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Response Rate</div>
                    <div className="text-sm text-muted-foreground">29%</div>
                  </div>
                  <Progress value={29} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Interview Rate</div>
                    <div className="text-sm text-muted-foreground">12%</div>
                  </div>
                  <Progress value={12} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Job Match Quality</div>
                    <div className="text-sm text-muted-foreground">92%</div>
                  </div>
                  <Progress value={92} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Analytics</CardTitle>
              <CardDescription>View your application performance over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <div className="flex h-full items-center justify-center">
                <Image
                  src="/images/analytics-chart.png"
                  alt="Application Analytics Chart"
                  width={600}
                  height={300}
                  className="h-full w-auto"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Recent agent and application activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[
                  {
                    title: "Agent found 5 new job opportunities",
                    description: "Based on your search criteria",
                    time: "2 hours ago",
                    icon: <Search className="h-4 w-4" />,
                  },
                  {
                    title: "Application sent to Acme Inc",
                    description: "Senior Developer position",
                    time: "5 hours ago",
                    icon: <FileText className="h-4 w-4" />,
                  },
                  {
                    title: "Email opened by Globex Corp",
                    description: "Product Manager application",
                    time: "Yesterday at 2:30 PM",
                    icon: <Mail className="h-4 w-4" />,
                  },
                  {
                    title: "Interview invitation received",
                    description: "From Stark Industries for UX Designer role",
                    time: "2 days ago",
                    icon: <CheckCircle className="h-4 w-4" />,
                  },
                ].map((activity, i) => (
                  <div key={i} className="flex">
                    <div className="mr-4 flex items-start">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        {activity.icon}
                      </div>
                      {i < 3 && <div className="h-full w-px bg-border mx-auto mt-3" />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Mail(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}
