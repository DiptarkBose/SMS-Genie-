## Inspiration

"The global scale and speed of the current educational disruption is unparalleled" - Audrey Azoulay, Director-General, UNESCO

As the world is still trying to cope up with the unprecedented Coronavirus pandemic, [education has come to a complete standstill for over 290 million students across the globe, reports United Nations](https://news.un.org/en/story/2020/03/1058791). Although students in urban areas are somewhat continuing learning due to internet services, students in many other parts of the world don't have access to a stable internet connection, and are also restricted to feature phones instead of smartphones. A closure of schools has resulted in a closure of education for them.

Our solution targets the demographic of students who have an iron will to continue learning, but are being unable to do so due to extremely poor internet connection or their monetary inability to purchase a smartphone. We realized that although the internet is still a commodity of leisure in many parts of the world, cellular connections are omnipresent, and people at least own a feature phone. We decided to leverage these thoughts for education in such uncertain times, and thus built SMS Genie - **A WAY TO ACCESS THE INTERNET, WITHOUT THE INTERNET!**

## What it does

SMS Genie is a platform-agnostic service that can help students continue their learning via simple cellular SMSs, **irrespective of internet presence and feature phone limitations.** 

Using just SMS, now students will be able to:

**1. Get subject related search results** 
       (Example: "Search who is Mahatma Gandhi", "search how many inches in a foot?")

**2. Get help in solving math problems**
       (Example: "Solve 2x+4=3")

**3. Get News headlines to stay up to date with current affairs**
       (Example: "Current Affairs please")

**4. Get facts to satiate their inquisitiveness**
       (Example: "Get me a space fact")

**5. Get language related answers when learning new languages** 
      (Example: "Translate I am here in Hindi", "Define Metamorphosis", "Example sentence using the word trial", "Word of the day")

**6. Get instructions on precautionary actions from the Coronavirus** 
      (Example: "Suggest some precautions for Corona")

**7. Get Coronavirus stats via SMS** 
      (Example: "Tell me the recent Corona stats")

The student receives answers via SMS. Clean. Simple. Efficient.
No need for internet to continue studying now!

## How we built it

We used Twilio to setup the SMS service, and Dialogflow for intent extraction. Next up, we hooked up each intent with relevant APIs to answer the students question in the best possible manner. The Query results are then sent to the student via Twilio. We have used a wide range of APIs to best cater to student quries such as DuckDuckGo, NewsAPI.

![Architecture](https://ibb.co/DD0X6Hz)

## Challenges we ran into

We had initial challenges for integrating such a wide array of APIs with the service in such a short span of time. Also, while working remotely from 3 major cities of India (Delhi, Hyderabad, Bangalore), we ourselves experienced slow internet speeds. While the United States is going forward in R&D for 5G, urban India still struggles with 4G networks, that still need to be massively improved. This struggle is prevalent across all third world countries around the world as well.

## Accomplishments that we are proud of

Given such a short time-frame, we were still able to integrate a lot of relevant and crucial services. Also, our product is production-ready, and could easily achieve a 100% penetration of the education market very quickly, since its platform-agnostic. We firmly believe that this SMS service has the ability to bring about a huge change in education at such uncertain times. 

## What we learned

From the tech aspect, we have gained a lot of experience while working on this service. We have been able to implement our premise very well, i.e, **"ACCESSING THE INTERNET, WITHOUT THE INTERNET".**
But what I wish to highlight and emphasise more, is that we got to understand a lot about this particular economic sector, and its immediate requirements. 

## What's next for SMS Genie

We wish to make SMS Genie a worldwide phenomenon, to help students learn, uninhibited, any time of the day. We wish to increase its appeal by adding capabilities of MMS to support multimedia files as well.
