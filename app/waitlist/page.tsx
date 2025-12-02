'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GridBackground } from '@/components/ui/grid-background'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { WaitlistSphere } from '@/components/ui/waitlist-sphere'
import { DownloadButton } from '@/components/ui/download-button'

type Step = 'name' | 'email' | 'phone' | 'school' | 'proficiency' | 'upload' | 'generating' | 'complete'

export default function WaitlistPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentStep, setCurrentStep] = useState<Step>('name')
  const [showVideo, setShowVideo] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    university: '',
    year: '',
    aiProficiency: 50,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [generatedAvatar, setGeneratedAvatar] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [waitlistCount, setWaitlistCount] = useState(0)
  const [allMembers, setAllMembers] = useState<any[]>([])
  const [showSlamAnimation, setShowSlamAnimation] = useState(true)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)
  const [showRattle, setShowRattle] = useState(false)
  const [universitySearch, setUniversitySearch] = useState('')
  const [universityMatches, setUniversityMatches] = useState<string[]>([])
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false)
  const [networkRadius, setNetworkRadius] = useState(180)
  const [uniqueUniversities, setUniqueUniversities] = useState<string[]>([])

  // Comprehensive university database
  const universities = [
    // San Diego Area Schools
    'University of California San Diego', 'San Diego State University', 'University of San Diego', 'Point Loma Nazarene University',
    'California State University San Marcos', 'National University', 'San Diego Christian College', 'John Paul the Great Catholic University',
    'Alliant International University', 'NewSchool of Architecture and Design', 'San Diego City College', 'San Diego Mesa College',
    'San Diego Miramar College', 'Grossmont College', 'Cuyamaca College', 'MiraCosta College', 'Palomar College',
    'Southwestern College', 'California College San Diego', 'San Diego Community College District', 'Platt College San Diego',

    // Top US Universities
    'Harvard University', 'Stanford University', 'Massachusetts Institute of Technology', 'Yale University', 'Princeton University',
    'Columbia University', 'University of Chicago', 'University of Pennsylvania', 'California Institute of Technology', 'Duke University',
    'Northwestern University', 'Johns Hopkins University', 'Dartmouth College', 'Brown University', 'Vanderbilt University',
    'Cornell University', 'Rice University', 'University of Notre Dame', 'University of California Los Angeles', 'University of California Berkeley',
    'Georgetown University', 'University of Michigan', 'Carnegie Mellon University', 'University of Virginia', 'University of Southern California',
    'Tufts University', 'Wake Forest University', 'New York University', 'University of North Carolina Chapel Hill', 'Boston College',
    'University of Rochester', 'Brandeis University', 'Georgia Institute of Technology', 'University of Wisconsin Madison', 'University of Illinois Urbana-Champaign',
    'University of Texas Austin', 'University of Washington', 'Ohio State University', 'University of Florida', 'Pennsylvania State University',

    // More Major US Universities
    'Boston University', 'Northeastern University', 'Tulane University', 'University of Miami', 'University of California Irvine',
    'University of California Davis', 'University of California Santa Barbara', 'Pepperdine University', 'Syracuse University',
    'Fordham University', 'University of Maryland', 'University of Georgia', 'Clemson University', 'Purdue University',
    'University of Minnesota', 'Texas A&M University', 'Virginia Tech', 'University of Pittsburgh', 'Rutgers University',
    'Indiana University Bloomington', 'Michigan State University', 'University of Iowa', 'University of Delaware',
    'Arizona State University', 'University of Arizona', 'University of Colorado Boulder', 'University of Connecticut',
    'University of Massachusetts Amherst', 'University of Alabama', 'Auburn University', 'Baylor University', 'Brigham Young University',

    // California Schools
    'University of California Riverside', 'University of California Merced', 'University of California Santa Cruz',
    'California State University Long Beach', 'California State University Fullerton', 'California State University Northridge',
    'California State University Los Angeles', 'California State University Sacramento', 'California State University Fresno',
    'California State University Chico', 'California State University San Bernardino', 'California State Polytechnic University Pomona',
    'California Polytechnic State University', 'San Jose State University', 'San Francisco State University', 'Humboldt State University',
    'Sonoma State University', 'California State University East Bay', 'California State University Monterey Bay', 'Santa Clara University',
    'University of the Pacific', 'Loyola Marymount University', 'Chapman University', 'Occidental College', 'Scripps College',
    'Pomona College', 'Claremont McKenna College', 'Harvey Mudd College', 'Pitzer College', 'Mills College', 'Whittier College',

    // More State Flagships & Major Public Universities
    'University of Alabama Birmingham', 'University of Alaska Anchorage', 'University of Arkansas', 'University of Central Florida',
    'University of Cincinnati', 'University of Denver', 'University of Hawaii Manoa', 'University of Houston', 'University of Idaho',
    'University of Illinois Chicago', 'University of Kansas', 'University of Kentucky', 'Louisiana State University', 'University of Louisville',
    'University of Maine', 'University of Mississippi', 'University of Missouri', 'University of Montana', 'University of Nebraska Lincoln',
    'University of Nevada Las Vegas', 'University of Nevada Reno', 'University of New Hampshire', 'University of New Mexico',
    'University of North Carolina Charlotte', 'University of North Carolina Greensboro', 'North Carolina State University',
    'University of North Dakota', 'University of Oklahoma', 'University of Oregon', 'Oregon State University', 'University of Rhode Island',
    'University of South Carolina', 'University of South Florida', 'University of Tennessee Knoxville', 'University of Utah',
    'Utah State University', 'University of Vermont', 'University of Wyoming', 'Washington State University', 'West Virginia University',

    // Major Private Universities
    'Emory University', 'Case Western Reserve University', 'Rochester Institute of Technology', 'Rensselaer Polytechnic Institute',
    'Worcester Polytechnic Institute', 'Stevens Institute of Technology', 'Drexel University', 'Villanova University', 'Marquette University',
    'University of Denver', 'University of Dayton', 'Gonzaga University', 'Seattle University', 'Loyola University Chicago',
    'DePaul University', 'Illinois Institute of Technology', 'Missouri University of Science and Technology', 'Southern Methodist University',
    'Texas Christian University', 'Baylor University', 'University of Tulsa', 'Creighton University', 'Drake University',

    // Liberal Arts Colleges
    'Williams College', 'Amherst College', 'Swarthmore College', 'Wellesley College', 'Bowdoin College', 'Carleton College',
    'Middlebury College', 'Grinnell College', 'Haverford College', 'Vassar College', 'Colgate University', 'Hamilton College',
    'Washington and Lee University', 'Smith College', 'Colby College', 'Bates College', 'Oberlin College', 'Macalester College',
    'Bryn Mawr College', 'Mount Holyoke College', 'Barnard College', 'Kenyon College', 'Reed College', 'Davidson College',

    // More Major Universities by State
    'George Washington University', 'American University', 'Florida State University', 'University of Central Florida',
    'Georgia State University', 'University of Illinois Springfield', 'Ball State University', 'Iowa State University',
    'Kansas State University', 'University of Maryland Baltimore County', 'University of Michigan Dearborn', 'Wayne State University',
    'Mississippi State University', 'University of Missouri Kansas City', 'Montana State University', 'University of North Texas',
    'Texas Tech University', 'University of Texas Dallas', 'University of Texas San Antonio', 'University of Texas Arlington',
    'Old Dominion University', 'George Mason University', 'Virginia Commonwealth University', 'College of William and Mary',
    'Eastern Washington University', 'Central Washington University', 'Western Washington University', 'University of Wisconsin Milwaukee',

    // HBCUs
    'Howard University', 'Spelman College', 'Morehouse College', 'Hampton University', 'North Carolina A&T State University',
    'Florida A&M University', 'Tuskegee University', 'Xavier University of Louisiana', 'Tennessee State University',
    'Morgan State University', 'Jackson State University', 'Alabama State University', 'Prairie View A&M University',

    // Technology & Engineering Schools
    'Colorado School of Mines', 'New Jersey Institute of Technology', 'Illinois Institute of Technology', 'Milwaukee School of Engineering',
    'Kettering University', 'Embry-Riddle Aeronautical University', 'Florida Institute of Technology', 'South Dakota School of Mines',

    // Additional Major Universities
    'Temple University', 'University of Memphis', 'Cleveland State University', 'University of Akron', 'Kent State University',
    'Bowling Green State University', 'Miami University', 'Ohio University', 'Wright State University', 'Youngstown State University',
    'Duquesne University', 'Saint Louis University', 'University of San Francisco', 'Loyola Marymount University',
    'Fairfield University', 'Providence College', 'Seton Hall University', 'Hofstra University', 'Adelphi University',
    'Pace University', 'St. John\'s University', 'Manhattan College', 'Marist College', 'Quinnipiac University',
    'University of Hartford', 'Sacred Heart University', 'Bentley University', 'Babson College', 'Emerson College',
    'Suffolk University', 'Clark University', 'Merrimack College', 'Stonehill College', 'Assumption University',

    // Regional State Universities
    'Eastern Michigan University', 'Western Michigan University', 'Central Michigan University', 'Northern Michigan University',
    'Eastern Illinois University', 'Western Illinois University', 'Northern Illinois University', 'Southern Illinois University',
    'Eastern Kentucky University', 'Western Kentucky University', 'Murray State University', 'Northern Kentucky University',
    'East Carolina University', 'Western Carolina University', 'Appalachian State University', 'UNC Wilmington',
    'East Tennessee State University', 'Middle Tennessee State University', 'Western Washington University',
    'Eastern Washington University', 'Southern Connecticut State University', 'Western Connecticut State University',

    // More Comprehensive Universities
    'James Madison University', 'Towson University', 'University of Delaware', 'Rowan University', 'Montclair State University',
    'William Paterson University', 'Kean University', 'Stockton University', 'Ramapo College', 'The College of New Jersey',
    'Salisbury University', 'Frostburg State University', 'Bowie State University', 'Coppin State University',
    'Radford University', 'Longwood University', 'Christopher Newport University', 'Norfolk State University',
    'Winthrop University', 'Coastal Carolina University', 'College of Charleston', 'The Citadel', 'Furman University',
    'Wofford College', 'Presbyterian College', 'Erskine College', 'University of North Florida', 'Florida Gulf Coast University',
    'Florida Atlantic University', 'Florida International University', 'Jacksonville University', 'Stetson University',
    'University of Tampa', 'Rollins College', 'Eckerd College', 'Nova Southeastern University', 'Lynn University',
    'Barry University', 'St. Thomas University', 'Florida Southern College', 'Embry-Riddle Aeronautical University',

    // Midwest Universities
    'Valparaiso University', 'Butler University', 'Evansville University', 'University of Indianapolis', 'IUPUI',
    'Loyola University Chicago', 'DePaul University', 'Roosevelt University', 'Columbia College Chicago', 'School of the Art Institute of Chicago',
    'Bradley University', 'Knox College', 'Augustana College', 'Millikin University', 'Elmhurst University',
    'North Central College', 'Benedictine University', 'Dominican University', 'Quincy University', 'McKendree University',
    'University of Wisconsin Green Bay', 'University of Wisconsin La Crosse', 'University of Wisconsin Oshkosh',
    'University of Wisconsin Stevens Point', 'University of Wisconsin Eau Claire', 'University of Wisconsin Whitewater',
    'University of Wisconsin Platteville', 'University of Wisconsin Stout', 'Marquette University', 'Milwaukee School of Engineering',
    'Carroll University', 'Carthage College', 'Lawrence University', 'Beloit College', 'Ripon College',

    // Northeast Universities
    'University of Maine Orono', 'University of Southern Maine', 'Colby College', 'Bowdoin College', 'Bates College',
    'University of New Hampshire', 'Southern New Hampshire University', 'Dartmouth College', 'Plymouth State University',
    'Keene State College', 'University of Vermont', 'Middlebury College', 'Champlain College', 'Saint Michael\'s College',
    'Norwich University', 'Castleton University', 'Rhode Island School of Design', 'Brown University', 'Providence College',
    'Bryant University', 'Johnson & Wales University', 'Salve Regina University', 'Roger Williams University',

    // New York Universities
    'Cornell University', 'Columbia University', 'New York University', 'Rochester Institute of Technology', 'Syracuse University',
    'University at Buffalo', 'Binghamton University', 'Stony Brook University', 'University at Albany', 'Rensselaer Polytechnic Institute',
    'Clarkson University', 'Union College', 'Colgate University', 'Hamilton College', 'Vassar College', 'Barnard College',
    'Skidmore College', 'Hobart and William Smith Colleges', 'St. Lawrence University', 'Ithaca College', 'Le Moyne College',
    'Nazareth College', 'St. John Fisher College', 'Canisius College', 'Niagara University', 'Manhattan College',
    'Siena College', 'Marist College', 'Iona College', 'Wagner College', 'St. Francis College', 'College of Mount Saint Vincent',

    // Pennsylvania Universities
    'University of Pennsylvania', 'Carnegie Mellon University', 'University of Pittsburgh', 'Penn State University',
    'Drexel University', 'Temple University', 'Villanova University', 'Lehigh University', 'Lafayette College', 'Bucknell University',
    'Dickinson College', 'Franklin & Marshall College', 'Gettysburg College', 'Haverford College', 'Swarthmore College',
    'Bryn Mawr College', 'Muhlenberg College', 'Ursinus College', 'Allegheny College', 'Juniata College', 'Susquehanna University',
    'Elizabethtown College', 'Messiah University', 'York College of Pennsylvania', 'Millersville University',
    'West Chester University', 'Kutztown University', 'Shippensburg University', 'East Stroudsburg University',
    'Bloomsburg University', 'Slippery Rock University', 'California University of Pennsylvania', 'Clarion University',
    'Edinboro University', 'Indiana University of Pennsylvania', 'Lock Haven University', 'Mansfield University',

    // Maryland & DC Universities
    'Johns Hopkins University', 'University of Maryland College Park', 'University of Maryland Baltimore County',
    'Loyola University Maryland', 'Goucher College', 'McDaniel College', 'St. Mary\'s College of Maryland',
    'Salisbury University', 'Towson University', 'Frostburg State University', 'Bowie State University',
    'Georgetown University', 'George Washington University', 'American University', 'Howard University', 'Catholic University of America',

    // Virginia Universities
    'University of Virginia', 'Virginia Tech', 'College of William and Mary', 'Washington and Lee University',
    'University of Richmond', 'Virginia Military Institute', 'Hampden-Sydney College', 'Randolph-Macon College',
    'Virginia Wesleyan University', 'Roanoke College', 'Hollins University', 'Sweet Briar College', 'Lynchburg University',
    'Bridgewater College', 'Shenandoah University', 'Marymount University', 'George Mason University',
    'Virginia Commonwealth University', 'Old Dominion University', 'James Madison University', 'Radford University',

    // UK Universities
    'University of Oxford', 'University of Cambridge', 'Imperial College London', 'London School of Economics', 'University College London',
    'University of Edinburgh', 'University of Manchester', 'King\'s College London', 'University of Bristol', 'University of Warwick',

    // Canadian Universities
    'University of Toronto', 'McGill University', 'University of British Columbia', 'University of Alberta', 'McMaster University',
    'University of Waterloo', 'Western University', 'Queen\'s University', 'University of Calgary', 'University of Ottawa',

    // Australian Universities
    'University of Melbourne', 'Australian National University', 'University of Sydney', 'University of Queensland', 'Monash University',

    // Other International
    'ETH Zurich', 'National University of Singapore', 'Tsinghua University', 'Peking University', 'University of Hong Kong',
    'Seoul National University', 'University of Tokyo', 'Kyoto University', 'Technical University of Munich', 'University of Amsterdam'
  ]

  useEffect(() => {
    fetch('/api/waitlist')
      .then(res => res.json())
      .then(data => {
        setWaitlistCount(data.entries?.length || 0)
        setAllMembers(data.entries || [])

        // Extract unique universities from waitlist members
        const universities = data.entries
          ?.map((member: any) => member.university)
          .filter((uni: string | null) => uni && uni.trim() !== '')

        // Get unique universities
        const unique = [...new Set(universities)] as string[]
        setUniqueUniversities(unique)
      })
      .catch(() => {})
  }, [currentStep])

  // Handle responsive network radius
  useEffect(() => {
    const updateRadius = () => {
      if (window.innerWidth < 640) {
        setNetworkRadius(120) // Mobile
      } else if (window.innerWidth < 768) {
        setNetworkRadius(140) // Small tablet
      } else {
        setNetworkRadius(180) // Desktop
      }
    }

    updateRadius()
    window.addEventListener('resize', updateRadius)
    return () => window.removeEventListener('resize', updateRadius)
  }, [])

  // University autocomplete search
  useEffect(() => {
    if (universitySearch.length > 0) {
      const matches = universities.filter(uni =>
        uni.toLowerCase().includes(universitySearch.toLowerCase())
      ).slice(0, 8)
      setUniversityMatches(matches)
      setShowUniversityDropdown(matches.length > 0)
    } else {
      setUniversityMatches([])
      setShowUniversityDropdown(false)
    }
  }, [universitySearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleNext = (nextStep: Step) => {
    // Validate email before proceeding
    if (currentStep === 'email' && nextStep === 'phone') {
      if (!validateEmail(formData.email)) {
        setError('Please enter a valid email address')
        return
      }
    }
    setError('')
    setCurrentStep(nextStep)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        // Auto-generate avatar after photo is loaded
        setTimeout(() => {
          handleGenerateAvatar(file)
        }, 500)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerateAvatar = async (file?: File) => {
    const imageToUse = file || imageFile
    if (!imageToUse) return

    setCurrentStep('generating')
    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('image', imageToUse)

      const response = await fetch('/api/generate-avatar', {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok) {
        setGeneratedAvatar(data.avatarUrl)

        // Submit to waitlist with avatar
        const waitlistResponse = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            avatarUrl: data.avatarUrl,
          }),
        })

        if (waitlistResponse.ok) {
          const newCount = waitlistCount + 1
          setWaitlistCount(newCount)
          setCurrentStep('complete')
        } else {
          const errorData = await waitlistResponse.json()
          setError(errorData.error || 'Failed to join waitlist')
          setCurrentStep('upload')
        }
      } else {
        setError(data.error || 'Failed to generate avatar')
        setCurrentStep('upload')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setCurrentStep('upload')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true)

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          university: formData.university,
          year: formData.year
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Student_Stack_Guide_${formData.firstName}_${formData.lastName}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsDownloadingPDF(false)
    }
  }

  const getProficiencyLabel = (value: number) => {
    if (value < 25) return 'Beginner'
    if (value < 50) return 'Learning'
    if (value < 75) return 'Intermediate'
    if (value < 90) return 'Advanced'
    return 'Expert'
  }

  const getStepConfig = () => {
    const firstName = formData.firstName || 'there'
    return {
      name: { title: "What's your name?", subtitle: 'Let us know who you are' },
      email: { title: `${firstName}, what's your email?`, subtitle: 'Where can we reach you?' },
      phone: { title: `What's your phone number, ${firstName}?`, subtitle: 'Optional but helps us stay connected' },
      school: { title: `Where do you go to school, ${firstName}?`, subtitle: 'Tell us about your university' },
      proficiency: { title: `${firstName}, how familiar are you with AI?`, subtitle: 'Help us personalize your experience' },
      upload: { title: `Upload your headshot, ${firstName}`, subtitle: "We'll transform you into a digital forefront character and add you to the network" },
      generating: { title: `Creating your character, ${firstName}...`, subtitle: 'Transforming you into a digital forefront character' },
      complete: { title: `You're in, ${firstName}!`, subtitle: 'Welcome to forefront' },
    }
  }

  const stepConfig = getStepConfig()

  return (
    <motion.main
      className="relative min-h-screen bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <GridBackground />

      <motion.div
        className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="w-full max-w-2xl mx-auto">
          {/* Progress Bar */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Step {currentStep === 'name' ? 1 : currentStep === 'email' ? 2 : currentStep === 'phone' ? 3 : currentStep === 'school' ? 4 : currentStep === 'proficiency' ? 5 : currentStep === 'upload' ? 6 : currentStep === 'generating' ? 6 : 7} of 7
              </span>
              <motion.span
                className="text-xs font-medium text-gray-500"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                {waitlistCount > 0 && `${waitlistCount}+ joined`}
              </motion.span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-black via-gray-800 to-black"
                initial={{ width: 0 }}
                animate={{
                  width: currentStep === 'name' ? '14.3%' :
                         currentStep === 'email' ? '28.6%' :
                         currentStep === 'phone' ? '42.9%' :
                         currentStep === 'school' ? '57.1%' :
                         currentStep === 'proficiency' ? '71.4%' :
                         currentStep === 'upload' ? '85.7%' :
                         '100%'
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </motion.div>

          {/* Logo - Smooth Fade In */}
          <motion.div
            className="text-center mb-12 relative"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Ambient glow behind logo */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.h1
              className="relative text-4xl sm:text-5xl font-black text-black mb-2"
              style={{ letterSpacing: '-2px' }}
              initial={{ opacity: 0, letterSpacing: '10px' }}
              animate={{ opacity: 1, letterSpacing: '-2px' }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              [forefront]
            </motion.h1>
            <motion.p
              className="text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              Join the future of AI learning
            </motion.p>

            {/* Conversion-focused stats */}
            <motion.div
              className="mt-6 flex items-center justify-center gap-6 text-xs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-gray-600 font-medium">{waitlistCount > 0 ? `${waitlistCount}` : '0'} students</span>
              </div>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-600 font-medium">2 min signup</span>
              </div>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-600 font-medium">100% free</span>
              </div>
            </motion.div>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Step: Name */}
            {currentStep === 'name' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <AnimatePresence mode="wait">
                  {!showVideo ? (
                    <motion.div
                      key="name-inputs"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center space-y-2 mb-8">
                        <h2 className="text-3xl font-bold text-black">{stepConfig.name.title}</h2>
                        <p className="text-gray-600">{stepConfig.name.subtitle}</p>
                      </div>

                      <div className="space-y-4 mb-8">
                        <motion.input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          onKeyPress={(e) => e.key === 'Enter' && formData.firstName && document.getElementsByName('lastName')[0]?.focus()}
                          className="w-full px-6 py-4 text-lg bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:border-black transition-all text-black placeholder-gray-400"
                          placeholder="First name"
                          autoFocus
                          whileFocus={{ scale: 1.01, borderColor: "#000" }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                        <motion.input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && formData.firstName && formData.lastName) {
                              setShowVideo(true)
                            }
                          }}
                          className="w-full px-6 py-4 text-lg bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:border-black transition-all text-black placeholder-gray-400"
                          placeholder="Last name"
                          whileFocus={{ scale: 1.01, borderColor: "#000" }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                      </div>

                      {/* Value Props */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200"
                      >
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 text-center">What you'll get:</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-700">Access to <span className="font-semibold">cutting-edge AI tools</span> for learning</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-700"><span className="font-semibold">Free student guide</span> worth $500+</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-700">Join a community of <span className="font-semibold">{waitlistCount > 0 ? waitlistCount : 'ambitious'} students</span></p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Enhanced Continue Button */}
                      <motion.button
                        onClick={() => setShowVideo(true)}
                        disabled={!formData.firstName || !formData.lastName}
                        className="relative w-full py-4 px-8 bg-black text-white font-semibold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-lg overflow-hidden group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{
                            x: ['-100%', '200%']
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                            ease: "easeInOut"
                          }}
                        />

                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 transition-all duration-500" />

                        <span className="relative z-10">Continue →</span>
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="video-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="text-center space-y-2 mb-8">
                        <h2 className="text-3xl font-bold text-black">
                          {formData.firstName}, watch this quick video
                        </h2>
                        <p className="text-gray-600">Learn what Forefront is all about</p>
                      </div>

                      {/* Video Player */}
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-200 mb-6 bg-gradient-to-br from-gray-100 to-gray-50">
                        <video
                          className="w-full h-full"
                          controls
                          autoPlay
                        >
                          <source src="/videos/forefront-waitlist.mp4" type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowVideo(false)}
                          className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl transition-all"
                        >
                          ← Back
                        </button>
                        <button
                          onClick={() => handleNext('email')}
                          className="flex-1 py-4 px-8 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-all text-lg"
                        >
                          Continue →
                        </button>
                        <button
                          onClick={() => handleNext('email')}
                          className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl transition-all"
                        >
                          Skip
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Step: Email */}
            {currentStep === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-3xl font-bold text-black">{stepConfig.email.title}</h2>
                  <p className="text-gray-600">{stepConfig.email.subtitle}</p>
                </div>

                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && formData.email && handleNext('phone')}
                    className={`w-full px-6 py-4 pr-12 text-lg bg-white border-2 rounded-xl focus:outline-none transition-all text-black placeholder-gray-400 ${
                      formData.email && !validateEmail(formData.email)
                        ? 'border-red-400 focus:border-red-500'
                        : formData.email && validateEmail(formData.email)
                        ? 'border-green-400 focus:border-green-500'
                        : 'border-gray-300 focus:border-black'
                    }`}
                    placeholder="your@email.com"
                    autoFocus
                  />
                  {formData.email && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {validateEmail(formData.email) ? (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </motion.svg>
                      ) : (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </motion.svg>
                      )}
                    </div>
                  )}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleNext('email')}
                    className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => handleNext('phone')}
                    disabled={!formData.email}
                    className="flex-1 py-4 px-8 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-lg"
                  >
                    Continue →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step: Phone */}
            {currentStep === 'phone' && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-3xl font-bold text-black">{stepConfig.phone.title}</h2>
                  <p className="text-gray-600">{stepConfig.phone.subtitle}</p>
                </div>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && formData.phone && handleNext('school')}
                  className="w-full px-6 py-4 text-lg bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:border-black transition-all text-black placeholder-gray-400"
                  placeholder="+1 (555) 000-0000"
                  autoFocus
                />

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleNext('email')}
                      className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => handleNext('school')}
                      disabled={!formData.phone}
                      className="flex-1 py-4 px-8 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-lg"
                    >
                      Continue →
                    </button>
                  </div>
                  {!formData.phone && (
                    <button
                      onClick={() => handleNext('school')}
                      className="w-full text-sm text-gray-500 hover:text-black transition-all py-2"
                    >
                      Skip this step
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step: School */}
            {currentStep === 'school' && (
              <motion.div
                key="school"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-3xl font-bold text-black">{stepConfig.school.title}</h2>
                  <p className="text-gray-600">{stepConfig.school.subtitle}</p>
                </div>

                {/* Animated University Carousel - "Students already using at..." */}
                {uniqueUniversities.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-8 overflow-hidden"
                  >
                    <p className="text-xs font-semibold text-gray-500 text-center mb-3 uppercase tracking-wider">
                      Students already using at
                    </p>
                    <div className="relative h-12 overflow-hidden">
                      {/* Gradient fade edges */}
                      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
                      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

                      {/* Scrolling universities - from actual waitlist */}
                      <motion.div
                        className="flex gap-8 items-center absolute"
                        animate={{
                          x: [0, -(uniqueUniversities.length * 200)]
                        }}
                        transition={{
                          duration: uniqueUniversities.length * 3,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        {/* Double the array for seamless loop */}
                        {[...uniqueUniversities, ...uniqueUniversities].map((uni, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-gray-50 to-white rounded-full border border-gray-200 whitespace-nowrap shadow-sm"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-gray-700">{uni}</span>
                          </div>
                        ))}
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* University Autocomplete */}
                <div className="relative">
                  <input
                    type="text"
                    value={universitySearch}
                    onChange={(e) => {
                      setUniversitySearch(e.target.value)
                      setFormData({ ...formData, university: e.target.value })
                    }}
                    onFocus={() => universitySearch.length > 0 && setShowUniversityDropdown(true)}
                    className="w-full px-6 py-4 text-lg bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:border-black transition-all text-black placeholder-gray-400"
                    placeholder="Start typing your university..."
                    autoFocus
                  />

                  {/* Autocomplete Dropdown */}
                  {showUniversityDropdown && universityMatches.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto"
                    >
                      {universityMatches.map((uni, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setFormData({ ...formData, university: uni })
                            setUniversitySearch(uni)
                            setShowUniversityDropdown(false)
                          }}
                          className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                        >
                          <p className="font-medium text-black">{uni}</p>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Year Selector */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">Current Year</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'Other'].map((year) => (
                      <button
                        key={year}
                        onClick={() => setFormData({ ...formData, year })}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                          formData.year === year
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-black hover:bg-gray-200'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleNext('phone')}
                    className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => handleNext('proficiency')}
                    disabled={!formData.university || !formData.year}
                    className="flex-1 py-4 px-8 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-lg"
                  >
                    Continue →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step: AI Proficiency */}
            {currentStep === 'proficiency' && (
              <motion.div
                key="proficiency"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-3xl font-bold text-black">{stepConfig.proficiency.title}</h2>
                  <p className="text-gray-600">{stepConfig.proficiency.subtitle}</p>
                </div>

                {/* Simple, Clean Slider */}
                <div className="space-y-6 mb-8">
                  {/* Current level label */}
                  <div className="text-center">
                    <div className="inline-block bg-black text-white px-8 py-3 rounded-full text-xl font-bold">
                      {getProficiencyLabel(formData.aiProficiency)}
                    </div>
                  </div>

                  {/* Clean slider */}
                  <div className="relative px-2 py-4">
                    {/* Track */}
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-black rounded-full transition-all duration-200"
                        style={{ width: `${formData.aiProficiency}%` }}
                      />
                    </div>

                    {/* Thumb */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200"
                      style={{ left: `calc(${formData.aiProficiency}% - 12px)` }}
                    >
                      <div className="w-6 h-6 bg-black rounded-full border-4 border-white shadow-lg" />
                    </div>

                    {/* Input slider */}
                    <input
                      type="range"
                      name="aiProficiency"
                      min="0"
                      max="100"
                      value={formData.aiProficiency}
                      onChange={handleInputChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>

                  {/* Labels */}
                  <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span>Beginner</span>
                    <span>Expert</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleNext('school')}
                    className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => handleNext('upload')}
                    className="flex-1 py-4 px-8 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-all text-lg"
                  >
                    Continue →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step: Upload Photo */}
            {currentStep === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-3xl font-bold text-black">{stepConfig.upload.title}</h2>
                  <p className="text-gray-600">{stepConfig.upload.subtitle}</p>
                </div>

                {/* Integrated Upload Button + Sphere */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="relative flex items-center justify-center"
                  style={{ minHeight: '600px' }}
                >
                  {/* 3D Sphere Background */}
                  <div className="absolute inset-0">
                    <WaitlistSphere
                      className="w-full h-full"
                      containerSize={600}
                    />
                  </div>

                  {/* Upload Button - Centered & Elevated */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, type: 'spring', duration: 0.6 }}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="relative group cursor-pointer"
                    >
                      {/* Outer glow layers for depth */}
                      <motion.div
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/40 via-purple-400/40 to-pink-400/40 blur-2xl"
                      />

                      <motion.div
                        animate={{
                          scale: [1, 1.08, 1],
                          opacity: [0.4, 0.7, 0.4]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.5
                        }}
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-black/20 blur-xl"
                      />

                      {/* Upload button - liquid glass effect */}
                      <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-2xl group-hover:shadow-black/40 transition-all duration-500">
                        {/* Gradient background with shimmer */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-white/95 to-gray-100/90" />

                        {/* Glass refraction layer */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/60 to-transparent opacity-50" />

                        {/* Animated shimmer effect */}
                        <motion.div
                          animate={{
                            x: ['-100%', '200%'],
                            opacity: [0, 0.5, 0]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            repeatDelay: 1
                          }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-12"
                        />

                        {/* Bubble highlights */}
                        <div className="absolute top-4 right-8 w-6 h-6 rounded-full bg-white/60 blur-sm" />
                        <div className="absolute top-8 right-12 w-4 h-4 rounded-full bg-white/40 blur-sm" />
                        <div className="absolute bottom-6 left-6 w-8 h-8 rounded-full bg-white/30 blur-md" />

                        {/* Frosted glass border */}
                        <div className="absolute inset-0 rounded-full border-[3px] border-white/80 backdrop-blur-xl" />

                        {/* Inner shadow ring */}
                        <div className="absolute inset-[2px] rounded-full shadow-[inset_0_2px_20px_rgba(0,0,0,0.1)]" />

                        {/* Content layer */}
                        <div className="relative w-full h-full flex items-center justify-center backdrop-blur-md">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <motion.div
                              className="text-center"
                              whileHover={{ scale: 1.05 }}
                              transition={{ type: "spring", stiffness: 400 }}
                            >
                              <motion.svg
                                className="w-16 h-16 mx-auto text-gray-400 group-hover:text-black transition-colors duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                animate={{
                                  y: [0, -3, 0]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </motion.svg>
                              <span className="text-sm font-semibold text-gray-500 group-hover:text-black transition-colors duration-300">Upload</span>
                            </motion.div>
                          )}
                        </div>

                        {/* Hover state glow */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500" />
                      </div>
                    </button>

                    {/* Change photo button */}
                    {imagePreview && (
                      <motion.button
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => {
                          setImagePreview('')
                          setImageFile(null)
                        }}
                        className="mt-6 px-6 py-2 bg-white/90 backdrop-blur-md hover:bg-white text-black font-semibold rounded-full shadow-lg transition-all border-2 border-black/10 hover:border-black"
                      >
                        Change photo
                      </motion.button>
                    )}
                  </motion.div>
                </motion.div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center mt-6"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => handleNext('proficiency')}
                    className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl transition-all"
                  >
                    ← Back
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step: Generating */}
            {currentStep === 'generating' && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-8 py-12"
              >
                <div className="w-24 h-24 mx-auto">
                  <div className="w-full h-full rounded-full border-4 border-gray-200 border-t-black animate-spin" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-black">{stepConfig.generating.title}</h2>
                  <p className="text-gray-600">{stepConfig.generating.subtitle}</p>
                </div>
              </motion.div>
            )}

            {/* Step: Complete */}
            {currentStep === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 py-8"
              >
                {/* Success Animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="relative"
                >
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-black to-gray-700 flex items-center justify-center shadow-xl">
                    <motion.svg
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="w-12 h-12 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3"
                >
                  <h2 className="text-5xl font-bold text-black">You're in!</h2>
                  <p className="text-xl text-gray-600">Welcome to the forefront</p>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="inline-block bg-gradient-to-r from-black to-gray-700 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg"
                  >
                    You're #{waitlistCount} on the waitlist
                  </motion.div>
                </motion.div>

                {/* Enhanced Profile Preview Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-10 border-2 border-gray-200 shadow-xl overflow-hidden"
                >
                  {/* Decorative background elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-100 to-transparent rounded-full blur-3xl opacity-50" />

                  <div className="relative space-y-6">
                    <div className="flex flex-col items-center gap-6">
                      {/* Large Avatar Display */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-600 rounded-full blur-xl opacity-20" />
                        <Avatar className="relative w-32 h-32 border-4 border-white shadow-2xl ring-2 ring-black/10">
                          {generatedAvatar ? (
                            <AvatarImage src={generatedAvatar} alt="Generated avatar" className="object-cover" />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-black to-gray-700 text-white text-4xl font-bold">
                              {formData.firstName[0]}{formData.lastName[0]}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </motion.div>

                      {/* User Info */}
                      <div className="text-center space-y-3">
                        <h3 className="text-3xl font-bold text-black tracking-tight">
                          {formData.firstName} {formData.lastName}
                        </h3>
                        <p className="text-gray-600 font-medium">{formData.email}</p>
                        <div className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          {getProficiencyLabel(formData.aiProficiency)}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Student Stack Guide Download Section */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="relative bg-gradient-to-br from-black via-gray-900 to-black text-white rounded-2xl p-8 sm:p-10 overflow-hidden shadow-2xl"
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-pulse" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-3xl" />

                  <div className="relative space-y-6">
                    {/* Header with value badge */}
                    <div className="text-center space-y-3">
                      <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="inline-flex items-center gap-2 bg-green-500 text-black px-5 py-1.5 rounded-full font-semibold text-sm"
                      >
                        <span>$500+ FREE VALUE</span>
                      </motion.div>

                      <h2 className="text-2xl sm:text-3xl font-bold text-white">
                        Get Your Free Student Stack Guide
                      </h2>

                      <p className="text-gray-400 text-base max-w-md mx-auto">
                        The ultimate collection of AI tools curated specifically for students.
                        Save hours on assignments and boost your academic performance.
                      </p>
                    </div>

                    {/* Tools list - simple text version */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-center"
                    >
                      <p className="text-gray-500 text-sm mb-3">Your complete student AI toolkit includes:</p>
                      <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                        {[
                          'AI Writing Assistants', 'Research Tools', 'Code Companions',
                          'Study Aids', 'Note-Taking Apps', 'Citation Generators',
                          'Productivity Boosters', 'Learning Platforms'
                        ].map(tool => (
                          <span key={tool} className="text-gray-400 text-sm">
                            {tool}
                            {tool !== 'Learning Platforms' && <span className="mx-1">•</span>}
                          </span>
                        ))}
                      </div>
                    </motion.div>

                    {/* Download button */}
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.1, type: "spring" }}
                      className="flex flex-col items-center"
                    >
                      <DownloadButton
                        onClick={handleDownloadPDF}
                        isDownloading={isDownloadingPDF}
                      />
                    </motion.div>

                    {/* Bottom text */}
                    <div className="text-center space-y-2 pt-2">
                      <p className="text-xs text-gray-500">
                        Instant download • No spam • Setup in 5 minutes
                      </p>
                      <p className="text-xs text-gray-400">
                        {waitlistCount} students already downloaded today
                      </p>
                    </div>

                    {/* Personalized message */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                      className="text-center"
                    >
                      <p className="text-gray-500 text-sm">
                        Hey {formData.firstName}, as a {formData.year} at {formData.university},
                        this guide is specifically curated for your academic journey.
                      </p>
                    </motion.div>
                  </div>
                </motion.div>

                {/* 3D Sphere Network Visualization */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="mt-8"
                >
                  <WaitlistSphere
                    currentUser={{
                      firstName: formData.firstName,
                      avatarUrl: generatedAvatar
                    }}
                    className="w-full"
                    containerSize={600}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: black;
          cursor: pointer;
          border: 4px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        input[type='range']::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: black;
          cursor: pointer;
          border: 4px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </motion.main>
  )
}
