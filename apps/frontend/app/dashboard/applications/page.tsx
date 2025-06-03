"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, MoreHorizontal, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")

  const applications = [
    {
      id: 1,
      jobTitle: "Senior Frontend Developer",
      company: "Acme Inc",
      source: "LinkedIn",
      email: "hiring@acmeinc.com",
      status: "Sent",
      date: "2023-05-15",
    },
    {
      id: 2,
      jobTitle: "Product Manager",
      company: "Globex Corp",
      source: "Twitter",
      email: "jobs@globexcorp.com",
      status: "Opened",
      date: "2023-05-14",
    },
    {
      id: 3,
      jobTitle: "UX Designer",
      company: "Stark Industries",
      source: "Reddit",
      email: "careers@starkindustries.com",
      status: "Replied",
      date: "2023-05-12",
    },
    {
      id: 4,
      jobTitle: "Frontend Developer",
      company: "Wayne Enterprises",
      source: "Google",
      email: "hr@wayneenterprises.com",
      status: "Sent",
      date: "2023-05-10",
    },
    {
      id: 5,
      jobTitle: "Full Stack Developer",
      company: "Oscorp Industries",
      source: "LinkedIn",
      email: "tech@oscorp.com",
      status: "Rejected",
      date: "2023-05-08",
    },
    {
      id: 6,
      jobTitle: "DevOps Engineer",
      company: "Umbrella Corporation",
      source: "Twitter",
      email: "devops@umbrella.com",
      status: "Interview",
      date: "2023-05-05",
    },
    {
      id: 7,
      jobTitle: "Mobile Developer",
      company: "Cyberdyne Systems",
      source: "Reddit",
      email: "mobile@cyberdyne.com",
      status: "Sent",
      date: "2023-05-03",
    },
    {
      id: 8,
      jobTitle: "Data Scientist",
      company: "Initech",
      source: "Google",
      email: "data@initech.com",
      status: "Opened",
      date: "2023-05-01",
    },
  ]

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      searchTerm === "" ||
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    const matchesSource = sourceFilter === "all" || app.source === sourceFilter

    return matchesSearch && matchesStatus && matchesSource
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Sent":
        return <Badge variant="outline">Sent</Badge>
      case "Opened":
        return <Badge variant="secondary">Opened</Badge>
      case "Replied":
        return <Badge className="bg-blue-500">Replied</Badge>
      case "Interview":
        return <Badge className="bg-green-500">Interview</Badge>
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Application History</h1>
          <p className="text-muted-foreground">Track all your job applications</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search applications..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Sent">Sent</SelectItem>
              <SelectItem value="Opened">Opened</SelectItem>
              <SelectItem value="Replied">Replied</SelectItem>
              <SelectItem value="Interview">Interview</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              <SelectItem value="Twitter">Twitter</SelectItem>
              <SelectItem value="Reddit">Reddit</SelectItem>
              <SelectItem value="Google">Google</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium">{application.jobTitle}</TableCell>
                <TableCell>{application.company}</TableCell>
                <TableCell>{application.source}</TableCell>
                <TableCell className="text-muted-foreground">{application.email}</TableCell>
                <TableCell>{getStatusBadge(application.status)}</TableCell>
                <TableCell>{new Date(application.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Update Status</DropdownMenuItem>
                      <DropdownMenuItem>Send Follow-up</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
